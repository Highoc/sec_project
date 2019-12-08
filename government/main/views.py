from django.views.generic import ListView
from main.models import Person


class PersonListView(ListView):
    model = Person
    template_name = 'main/person_list.html'
