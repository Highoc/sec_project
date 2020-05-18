from django.views.generic import ListView, View
from django.http import JsonResponse, HttpResponseNotFound
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
    def get(self, request, series, number):
        person = Person.objects.filter(passport_series=series, passport_number=number).first()

        if person:
            return JsonResponse({
                'first_name': person.first_name,
                'last_name': person.last_name,
                'patronymic': person.patronymic,
                'birth_date': person.birth_date,
                'address': person.address,
                'passport_series': person.passport_series,
                'passport_number': person.passport_number,
                'signature_public_key': person.signature_public_key.decode('utf-8'),
                #'signature_i': person.signature_i.decode('utf-8'),
            })
        else:
            return HttpResponseNotFound('Person doesn\'t exist')