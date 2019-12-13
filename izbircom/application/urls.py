"""application URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import re_path
from election.views import ElectionListView, CandidateListView, RegisterVoterView


def mock(request):
    return 0


urlpatterns = [
    re_path(r'^admin/', admin.site.urls),
    re_path(r'^election/$', ElectionListView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/$', mock),
    re_path(r'^election/(?P<election_id>[0-9]+)/candidate/$', CandidateListView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/register/$', RegisterVoterView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/sign/election_private_key/$', mock),
    re_path(r'^election/(?P<election_id>[0-9]+)/sign/contract/$', mock),
]
