from application.settings import SIGNATURE_ELECTION_PUBLIC

with open('../../../election_keys/public.pem', 'wb') as f:
    f.write(SIGNATURE_ELECTION_PUBLIC)