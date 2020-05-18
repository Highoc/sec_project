from django.views.generic import View
from django.http import JsonResponse, HttpResponseNotFound
from application.settings import SIGNATURE_ELECTION_PUBLIC, SIGNATURE_ELECTION_PRIVATE

from datetime import datetime
import requests, json

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Election, Voter, Contract, Vote, Candidate, CheckInfo
from .helpers import sign_key, sign_data, check_sign, check_key


class ElectionListView(View):
    def get(self, request):
        current_ts = datetime.now()
        elections = Election.objects.filter(start_date__lte=current_ts, end_date__gte=current_ts)

        if elections:
            return JsonResponse([{
                'id': election.id,
                'name': election.name,
                'description': election.description,
                'start_date': election.start_date,
                'end_date': election.end_date,
                'is_finished': election.is_finished,
                'is_checked': election.is_checked,
            } for election in elections], safe=False)
        else:
            return HttpResponseNotFound('Elections doesn\'t exist')


class CandidateListView(View):
    def get(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts).first()
        if election:
            candidates = election.candidates.all()

            if candidates:
                serialized_candidates = []
                for candidate in candidates:
                    url = 'http://localhost:8000/person/{}/{}/'.format(candidate.passport_series, candidate.passport_number)
                    response = requests.get(url)
                    if response.status_code == 200:
                        person = response.json()
                        serialized_candidates.append({
                            'id': candidate.id,
                            'first_name': person['first_name'],
                            'last_name': person['last_name'],
                            'patronymic': person['patronymic'],
                            'description': candidate.description,
                        })

                return JsonResponse(serialized_candidates, safe=False)

        return HttpResponseNotFound('Elections doesn\'t exist')


class RegisterVoterView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(RegisterVoterView, self).dispatch(request, *args, **kwargs)

    def post(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts,
                                           is_finished=False).first()
        if not election:
            return HttpResponseNotFound('Election is incorrect')

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        passport_series = body.get('passport_series', None)
        passport_number = body.get('passport_number', None)
        first_name = body.get('first_name', None)
        last_name = body.get('last_name', None)
        patronymic = body.get('patronymic', None)

        if not passport_number or\
           not passport_series or\
           not first_name or\
           not last_name or\
           not patronymic:
            return HttpResponseNotFound('Credentials is incorrect')

        voter = Voter.objects.filter(passport_series=passport_series,
                                     passport_number=passport_number,
                                     election=election).first()

        if not voter:
            url = f'http://localhost:8000/person/{passport_series}/{passport_number}/'
            response = requests.get(url)
            if response.status_code != 200:
                return HttpResponseNotFound('Credentials is incorrect')

            person = response.json()

            if first_name != person['first_name'] or\
               last_name != person['last_name'] or\
               patronymic != person['patronymic']:
                return HttpResponseNotFound('Credentials is incorrect')

            voter = Voter.objects.create(first_name=first_name,
                                         last_name=last_name,
                                         patronymic=patronymic,
                                         passport_series=passport_series,
                                         passport_number=passport_number,
                                         signature_public_key=person['signature_public_key'].encode('utf-8'),
                                         election=election)

        passport_number_signed = body.get('passport_number_signed', None)
        if not passport_number_signed or not check_sign(str(passport_number), passport_number_signed, voter.signature_public_key):
            return HttpResponseNotFound('Voter sign is incorrect')

        if voter.contract:
            return JsonResponse({
                'id': voter.id,
                'k': {
                    'info': voter.contract.info,
                    'vote_private_key_masked': voter.contract.vote_private_key_masked.decode('utf-8'),
                    'check_public_key_masked': voter.contract.check_public_key_masked.decode('utf-8'),
                    'vote_private_key_masked_signed': voter.contract.vote_private_key_masked_signed.decode('utf-8'),
                },
                'k_signed_by_voter': voter.contract.k_signed_by_voter.decode('utf-8'),
                'k_signed_by_election': voter.contract.k_signed_by_election.decode('utf-8'),
            })
        else:
            return JsonResponse({
                'id': voter.id
            })


class SignVoterElectionPrivateKeyView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(SignVoterElectionPrivateKeyView, self).dispatch(request, *args, **kwargs)

    def post(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts,
                                           is_finished=False).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        voter_id = body.get('voter_id', None)
        voter_id_signed = body.get('voter_id_signed', None)

        voter = Voter.objects.filter(id=voter_id).first()
        if not voter:
            return HttpResponseNotFound('Voter doesn\'t exist')

        if not check_sign(str(voter_id), voter_id_signed, voter.signature_public_key):
            return HttpResponseNotFound('Voter sign is incorrect')

        if voter.vote_private_key_masked_signed:
            return JsonResponse({
                'signed_election_private_key': voter.vote_private_key_masked_signed.decode('utf-8'),
            })

        election_private_key = body.get('election_private_key', None)

        if not election_private_key:
            return HttpResponseNotFound('Election private key is incorrect')

        signed_election_private_key = sign_key(election_private_key)
        voter.vote_private_key_masked_signed = signed_election_private_key.encode('utf-8')
        voter.save()

        return JsonResponse({
            'signed_election_private_key': signed_election_private_key,
        })


# Vote
class VoteView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(VoteView, self).dispatch(request, *args, **kwargs)

    def post(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts,
                                           is_finished=False).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        body_unicode = request.body.decode('utf-8')
        v = json.loads(body_unicode)

        candidate_id = v.get('candidate', None)
        vote_private_key = v.get('vote_private_key', None)
        check_public_key = v.get('check_public_key', None)
        vote_private_key_signed = v.get('vote_private_key_signed', None)
        candidate_crypted = v.get('candidate_crypted', None)

        candidate = Candidate.objects.filter(id=candidate_id).first()
        if not election or\
           not candidate or\
           not vote_private_key or\
           not check_public_key or\
           not vote_private_key_signed or\
           not candidate_crypted:
            return HttpResponseNotFound('Vote is incorrect')

        if not сheck_key(vote_private_key, vote_private_key_signed):
            return HttpResponseNotFound('vote_private_key_signed is incorrect')

        vote = Vote.objects.filter(
            election=election,
            vote_private_key_signed=vote_private_key_signed.encode('utf-8'),
        ).first()

        if vote:
            return HttpResponseNotFound('Vote exists')

        vote = Vote.objects.create(
            election=election,
            candidate=candidate,
            vote_private_key=vote_private_key.encode('utf-8'),
            check_public_key=check_public_key.encode('utf-8'),
            vote_private_key_signed=vote_private_key_signed.encode('utf-8'),
            candidate_crypted=candidate_crypted.encode('utf-8'),
        )

        v_signed = sign_data(json.dumps(v, ensure_ascii = False, separators=(',', ':')))

        return JsonResponse({
            'id': vote.id,
            'v_signed': v_signed.decode('utf-8'),
        })


class VoteListView(View):
    def get(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        return JsonResponse([{
            'id': vote.id,
            'candidate': vote.candidate.id,
            'vote_private_key': vote.vote_private_key.decode('utf-8'),
            'check_public_key': vote.check_public_key.decode('utf-8'),
            'candidate_crypted': vote.candidate_crypted.decode('utf-8'),
            'is_checked': vote.is_checked,
        } for vote in election.votes.all()], safe=False)


# Contract
class ContractView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(ContractView, self).dispatch(request, *args, **kwargs)

    def post(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        body_unicode = request.body.decode('utf-8')
        contract = json.loads(body_unicode)

        k = contract.get('k', None)
        credentials = contract.get('credentials', None)
        k_signed_by_voter = contract.get('k_signed_by_voter', None)

        if not k or\
           not credentials or\
           not k_signed_by_voter:
            return HttpResponseNotFound('Contract is incorrect')

        info = k.get('info', None)
        vote_private_key_masked = k.get('vote_private_key_masked', None)
        check_public_key_masked = k.get('check_public_key_masked', None)
        vote_private_key_masked_signed = k.get('vote_private_key_masked_signed', None)

        if not info or \
           not vote_private_key_masked or \
           not check_public_key_masked or \
           not vote_private_key_masked_signed:
            return HttpResponseNotFound('K is incorrect')

        passport_series = credentials.get('passport_series', None)
        passport_number = credentials.get('passport_number', None)

        if not passport_series or\
           not passport_number:
            return HttpResponseNotFound('Credentials is incorrect')

        voter = Voter.objects.filter(passport_series=passport_series,
                                     passport_number=passport_number,
                                     election=election).first()
        if not voter:
            return HttpResponseNotFound('Voter doesn\'t exist')

        if not check_sign(json.dumps(k, ensure_ascii = False, separators=(',', ':')), k_signed_by_voter, voter.signature_public_key):
            return HttpResponseNotFound('Voter sign is incorrect')

        if voter.contract:
            return HttpResponseNotFound('Voter contract exists')

        k_signed_by_election = sign_data(json.dumps(k, ensure_ascii = False, separators=(',', ':')))

        contract = Contract.objects.create(
            info=info,
            vote_private_key_masked=vote_private_key_masked.encode('utf-8'),
            check_public_key_masked=check_public_key_masked.encode('utf-8'),
            vote_private_key_masked_signed=vote_private_key_masked_signed.encode('utf-8'),
            k_signed_by_voter = k_signed_by_voter.encode('utf-8'),
            k_signed_by_election=k_signed_by_election,
        )

        voter.contract = contract
        voter.save()

        return JsonResponse({
            'k': k,
            'k_signed_by_voter': k_signed_by_voter,
            'k_signed_by_election': k_signed_by_election.decode('utf-8'),
        })


class ContractListView(View):
    def get(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        return JsonResponse([{
            'k': {
                'info': voter.contract.info,
                'vote_private_key_masked': voter.contract.vote_private_key_masked.decode('utf-8'),
                'check_public_key_masked': voter.contract.check_public_key_masked.decode('utf-8'),
                'vote_private_key_masked_signed': voter.contract.vote_private_key_masked_signed.decode('utf-8'),
            },
            'k_signed_by_voter': voter.contract.k_signed_by_voter.decode('utf-8'),
            'k_signed_by_election': voter.contract.k_signed_by_election.decode('utf-8'),
        } for voter in election.voters.all()], safe=False)


# Checking
class CheckView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(CheckView, self).dispatch(request, *args, **kwargs)

    def post(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts,
                                           is_finished=True,
                                           is_checked=False).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        body_unicode = request.body.decode('utf-8')
        check = json.loads(body_unicode)

        v = check.get('v', None)
        check_info_crypted = check.get('check_info_crypted', None)
        
        if not v or \
           not check_info_crypted:
            return HttpResponseNotFound('Check is incorrect')

        vote_id = v.get('vote_id', None)
        vote_private_key_signed = v.get('vote_private_key_signed', None)

        if not vote_id or \
           not vote_private_key_signed:
            return HttpResponseNotFound('Vote is incorrect')

        vote = Vote.objects.filter(id=vote_id,
                                   election=election,
                                   vote_private_key_signed=vote_private_key_signed.encode('utf-8')).first()
        if not vote:
            return HttpResponseNotFound('Vote is incorrect')

        check_info = CheckInfo.objects.filter(v=vote).first()
        if check_info:
            return HttpResponseNotFound('Check exists')

        check_info = CheckInfo.objects.create(v=vote, check_info_crypted=check_info_crypted.encode('utf-8'))

        check_signed = sign_data(json.dumps(check, ensure_ascii = False, separators=(',', ':')))

        return JsonResponse({
            'id': check_info.id,
            'check_signed': check_signed.decode('utf-8'),
        })


class CheckListView(View):
    def get(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        return JsonResponse([{
            'id': check_info.id,
            'v': {
                'id': check_info.v.id,
                'candidate': check_info.v.candidate.id,
                'vote_private_key': check_info.v.vote_private_key.decode('utf-8'),
                'check_public_key': check_info.v.check_public_key.decode('utf-8'),
                'vote_private_key_signed': check_info.v.vote_private_key_signed.decode('utf-8'),
                'candidate_signed': check_info.v.candidate_crypted.decode('utf-8'),
            },
            'check_info_crypted': check_info.check_info_crypted.decode('utf-8'),
        } for check_info in CheckInfo.objects.filter(v__in=election.votes.all())], safe=False)


class VoteCheckView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(VoteCheckView, self).dispatch(request, *args, **kwargs)

    def post(self, request, election_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts,
                                           is_finished=True,
                                           is_checked=False).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        body_unicode = request.body.decode('utf-8')
        check = json.loads(body_unicode)

        vote_id = check.get('vote_id', None)
        status = check.get('status', None)

        voter_id = check.get('voter_id', None)
        voter_id_signed = check.get('voter_id_signed', None)

        voter = Voter.objects.filter(id=voter_id, election=election).first()
        vote = Vote.objects.filter(id=vote_id, election=election).first()

        if not vote or\
           not voter or\
           not voter_id or\
           not voter_id_signed or\
           not check_sign(str(voter_id), voter_id_signed, voter.signature_public_key):
            return HttpResponseNotFound('Vote check is incorrect')

        if vote.is_checked is not None and vote.checked_by != voter:
            return HttpResponseNotFound('Vote check exist')

        vote.checked_by = voter
        vote.is_checked = status
        vote.save()

        return JsonResponse({
            'status': 'ok',
        })


# Election Keys
class PublicKeyView(View):
    def get(self, request):
        return JsonResponse({
            'public_key': SIGNATURE_ELECTION_PUBLIC.decode('utf-8'),
        })


class PrivateKeyView(View):
    def get(self, request):
        return JsonResponse({
            'private_key': SIGNATURE_ELECTION_PRIVATE.decode('utf-8'),
        })


class FinishVotingView(View):
    def get(self, request, election_id):
        election = Election.objects.filter(id=election_id).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        election.is_finished = True
        election.save()
        return JsonResponse({'status': 'finished'})


class FinishCheckingView(View):
    def get(self, request, election_id):
        election = Election.objects.filter(id=election_id, is_finished=True).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        election.is_checked = True
        election.save()
        results = {}
        for candidate in election.candidates.all():
            results[candidate.id] = 0

        for vote in election.votes.all():
            if vote.is_checked:
                results[vote.candidate.id] += 1

        return JsonResponse(results)


















def сheck_key(key, sign):
    check_key(key, sign)
    return True

