from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
from base64 import b64encode

from application.settings import SIGNATURE_ELECTION_PRIVATE


def sign_data(data):
    election_private_key = RSA.importKey(SIGNATURE_ELECTION_PRIVATE)
    government = PKCS1_v1_5.new(election_private_key)

    digest = SHA256.new()
    digest.update(data.encode())
    sign = government.sign(digest)
    return b64encode(sign)


def sign_key(key):
    election_private_key = RSA.importKey(SIGNATURE_ELECTION_PRIVATE)
    sign = pow(int(key), election_private_key.d, election_private_key.n)
    return str(sign)