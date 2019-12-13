from django.contrib import admin
from .models import Election, Candidate, Voter


admin.site.register(Election)
admin.site.register(Candidate)
admin.site.register(Voter)
