from django.views.generic import View
from django.http import JsonResponse, HttpResponseNotFound

from datetime import datetime

from .models import Election


class ElectionListView(View):
    def get(self, request):
        current_ts = datetime.now()
        elections = Election.objects.filter(start_date__lte=current_ts, end_date__gte=current_ts)

        if elections:
            return JsonResponse([{
                'name': election.name,
                'description': election.description,
                'start_date': election.start_date,
                'end_date': election.end_date,
            } for election in elections], safe=False)
        else:
            return HttpResponseNotFound('Elections doesn\'t exist')
