from django.contrib import admin
from .models import Election, Candidate, Voter, Vote, Contract, CheckInfo


admin.site.register(Election)
admin.site.register(Candidate)
admin.site.register(Voter)
admin.site.register(Vote)
admin.site.register(Contract)
admin.site.register(CheckInfo)