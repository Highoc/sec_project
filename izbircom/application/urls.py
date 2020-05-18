from django.contrib import admin
from django.urls import re_path

from election.views import VoteView, VoteListView, \
                           ContractView, ContractListView, SignVoterElectionPrivateKeyView, \
                           CheckView, CheckListView, VoteCheckView, \
                           ElectionListView, CandidateListView, RegisterVoterView, \
                           PublicKeyView, PrivateKeyView, \
                           FinishVotingView, FinishCheckingView

urlpatterns = [
    re_path(r'^admin/', admin.site.urls),

    re_path(r'^election/$', ElectionListView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/register/$', RegisterVoterView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/candidate/$', CandidateListView.as_view()),

    re_path(r'^election/(?P<election_id>[0-9]+)/check/$', CheckView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/check/list/$', CheckListView.as_view()),

    re_path(r'^election/(?P<election_id>[0-9]+)/contract/$', ContractListView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/contract/create/$', ContractView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/contract/sign/$', SignVoterElectionPrivateKeyView.as_view()),

    re_path(r'^election/(?P<election_id>[0-9]+)/vote/$', VoteListView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/vote/create/$', VoteView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/vote/check/$', VoteCheckView.as_view()),

    re_path(r'^public_key/$', PublicKeyView.as_view()),

    re_path(r'^election/(?P<election_id>[0-9]+)/finish/voting/$', FinishVotingView.as_view()),
    re_path(r'^election/(?P<election_id>[0-9]+)/finish/checking/$', FinishCheckingView.as_view()),
    # re_path(r'^private_key/$', PrivateKeyView.as_view()),
]
