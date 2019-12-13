from django.views.generic import View
from django.http import JsonResponse, HttpResponseNotFound

from datetime import datetime
import requests

from .models import Election


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