from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
from base64 import b64encode, b64decode


from application.settings import SIGNATURE_ELECTION_PRIVATE, SIGNATURE_ELECTION_PUBLIC


def sign_data(data):
    election_private_key = RSA.importKey(SIGNATURE_ELECTION_PRIVATE)
    government = PKCS1_v1_5.new(election_private_key)

    digest = SHA256.new()
    digest.update(data.encode('utf-8'))
    sign = government.sign(digest)
    return b64encode(sign)


def check_sign(data, sign, voter_public_key):
    signer_public_key = RSA.importKey(voter_public_key)
    digest = SHA256.new()
    digest.update(data.encode('utf-8'))
    verifier = PKCS1_v1_5.new(signer_public_key)
    return verifier.verify(digest, b64decode(sign))


def sign_key(key):
    election_private_key = RSA.importKey(SIGNATURE_ELECTION_PRIVATE)
    sign = pow(int(key), election_private_key.d, election_private_key.n)
    return str(sign)


def check_key(key, key_sign):
    election_public_key = RSA.importKey(SIGNATURE_ELECTION_PUBLIC)
    vote_private_key = RSA.importKey(key)
    sign = pow(int(key_sign), election_public_key.e, election_public_key.n)
    return sign == int(vote_private_key.d)
