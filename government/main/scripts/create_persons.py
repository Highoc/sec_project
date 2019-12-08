import django

django.setup()

from django.db import transaction
from application.settings import SIGNATURE_GOVERNMENT_PRIVATE
from main.models import Person

from random import random, choice, randint
from main.scripts.generate_RSA_pair import generate_RSA_pair, load_key_to_file

from datetime import datetime, timedelta

from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
from base64 import b64encode


def generate_birthdate(min_year=1900, max_year=2000):
    start = datetime(min_year, 1, 1, 00, 00, 00)
    years = max_year - min_year + 1
    end = start + timedelta(days=365 * years)
    return start + (end - start) * random()


def sign_person_info(info):
    government_private_key = RSA.importKey(SIGNATURE_GOVERNMENT_PRIVATE)
    government = PKCS1_v1_5.new(government_private_key)

    digest = SHA256.new()
    digest.update(info.encode())
    sign = government.sign(digest)
    return b64encode(sign)


def create_person():
    from mimesis import Person as MimesisPerson, locales, Address

    person = MimesisPerson(locales.RU)
    address = Address(locales.RU)

    with transaction.atomic():
        first_name = person.name()
        last_name = person.surname()

        gender = person.gender()
        if gender == 'Муж.':
            patronymic = choice(['Сергеевич', 'Николаевич', 'Артурович', 'Константинович', 'Игоревич'])
        else:
            patronymic = choice(['Александровна', 'Борисовна', 'Петровна', 'Юрьевна', 'Анатольевна'])

        birth_date = generate_birthdate()
        address = '{}, {}'.format(address.federal_subject(), address.address())

        passport_series = randint(1000, 7000)
        passport_number = randint(100000, 999999)

        pair = generate_RSA_pair()

        signature_public_key = pair[1]
        load_key_to_file('../../../person_signature_private_keys/{}_{}_{}_{}.pem'.format(passport_series, passport_number, last_name, first_name), pair[0])

        person_info = '{} {} {} {} {} {} {} {}'.format(first_name,
                                                       last_name,
                                                       patronymic,
                                                       birth_date,
                                                       address,
                                                       passport_series,
                                                       passport_number,
                                                       signature_public_key)

        signature_i = sign_person_info(person_info)

        Person(first_name=first_name,
               last_name=last_name,
               patronymic=patronymic,
               birth_date=birth_date,
               address=address,
               passport_series=passport_series,
               passport_number=passport_number,
               signature_public_key=signature_public_key,
               signature_i=signature_i).save()


for i in range(30):
    create_person()
