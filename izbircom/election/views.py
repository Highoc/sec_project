from django.views.generic import View
from django.http import JsonResponse, HttpResponseNotFound
from application.settings import SIGNATURE_ELECTION_PUBLIC, SIGNATURE_ELECTION_PRIVATE

from datetime import datetime
import requests, json

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Election, Voter
from .helpers import sign_key


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
                                           end_date__gte=current_ts).first()
        if not election:
            return HttpResponseNotFound('Election is incorrect')

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        passport_series = body.get('passport_series', None)
        passport_number = body.get('passport_number', None)

        if not passport_number or not passport_series:
            return HttpResponseNotFound('Passport is incorrect')

        url = f'http://localhost:8000/person/{passport_series}/{passport_number}/'
        response = requests.get(url)
        if response.status_code != 200:
            return HttpResponseNotFound('Passport is incorrect')

        first_name = body.get('first_name', None)
        last_name = body.get('last_name', None)
        patronymic = body.get('patronymic', None)

        voter = Voter.objects.filter(passport_series=passport_series,
                                     passport_number=passport_number,
                                     first_name=first_name,
                                     last_name=last_name,
                                     patronymic=patronymic,
                                     election=election).first()

        if not voter:
            person = response.json()

            if not first_name or first_name != person['first_name'] or\
               not last_name or last_name != person['last_name'] or\
               not patronymic or  patronymic != person['patronymic']:
                return HttpResponseNotFound('Passport is incorrect')

            voter = Voter.objects.create(first_name=person['first_name'],
                                         last_name=person['last_name'],
                                         patronymic=person['patronymic'],
                                         passport_series=person['passport_series'],
                                         passport_number=person['passport_number'],
                                         signature_public_key=person['signature_public_key'].encode(),
                                         election=election)

        if voter.vote or voter.contract:
            return HttpResponseNotFound('Voter is already exists')

        return JsonResponse({
            'id': voter.id
        })


class SignVoterElectionPrivateKeyView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(SignVoterElectionPrivateKeyView, self).dispatch(request, *args, **kwargs)

    def post(self, request, election_id, voter_id):
        current_ts = datetime.now()
        election = Election.objects.filter(id=election_id,
                                           start_date__lte=current_ts,
                                           end_date__gte=current_ts).first()
        if not election:
            return HttpResponseNotFound('Election doesn\'t exist')

        voter = Voter.objects.filter(id=voter_id).first()
        if not voter:
            return HttpResponseNotFound('Voter doesn\'t exist')

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        election_private_key =  body.get('election_private_key', None)

        if not election_private_key:
            return HttpResponseNotFound('Election private key is incorrect')

        signed_election_private_key = sign_key(election_private_key)

        return JsonResponse({
            'signed_election_private_key': signed_election_private_key,
        })


class SignVoterContractView(View):
    pass


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
