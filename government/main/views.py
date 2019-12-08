from django.views.generic import ListView, View
from django.http import JsonResponse
from main.models import Person
from django.db.models import Q


class PersonListView(ListView):
    model = Person
    template_name = 'main/person_list.html'

    context_object_name = 'persons'

    def get_queryset(self):
        persons = super(PersonListView, self).get_queryset()
        search = self.request.GET.get('search', None)

        if search:
            persons = persons.filter(Q(first_name__icontains=search) |
                                     Q(last_name__icontains=search) |
                                     Q(patronymic__icontains=search))
        return persons


class PersonView(View):
    def get(self):
        return JsonResponse({ 'a': 'b '})