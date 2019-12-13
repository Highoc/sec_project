from django.db import models


class Election(models.Model):
    name = models.CharField(max_length=128, verbose_name='Название голосования')
    description = models.TextField(max_length=1024, verbose_name='Описание голосования')

    start_date = models.DateTimeField(verbose_name='Дата начала голосования')
    end_date = models.DateTimeField(verbose_name='Дата окончания голосования')

    def __str__(self):
        return '{} - {} | {}'.format(self.start_date.strftime("%Y-%m-%d %H:%M:%S"), self.end_date.strftime("%Y-%m-%d %H:%M:%S"), self.name)

    class Meta:
        verbose_name = 'Голосование'
        verbose_name_plural = 'голосования'
        unique_together = ['name', 'start_date', 'end_date']
        ordering = ['start_date', 'end_date', 'name']


class Voter(models.Model):
    first_name = models.CharField(max_length=32, verbose_name='Имя')
    last_name = models.CharField(max_length=32, verbose_name='Фамилия')
    patronymic = models.CharField(max_length=32, verbose_name='Отчество')

    passport_series = models.IntegerField(verbose_name='Серия паспорта голосующего')
    passport_number = models.IntegerField(verbose_name='Номер паспорта голосующего')

    signature_public_key = models.BinaryField(verbose_name='Публичный ключ личной ЭЦП')
    election = models.ForeignKey(Election, verbose_name='Голосование', related_name='voters', on_delete=models.CASCADE)

    vote = models.OneToOneField('election.Vote', verbose_name='Голос', related_name='voter', on_delete=models.SET_NULL, null=True)
    contract = models.OneToOneField('election.Contract', verbose_name='Контракт', related_name='voter', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return '{} {} | {}'.format(self.passport_series, self.passport_number, self.election.name)

    class Meta:
        verbose_name = 'Голосующий'
        verbose_name_plural = 'голосующие'
        unique_together = ['passport_series', 'passport_number', 'election']


class Candidate(models.Model):
    passport_series = models.IntegerField(verbose_name='Серия паспорта кандидата')
    passport_number = models.IntegerField(verbose_name='Номер паспорта кандидата')

    description = models.TextField(max_length=1024, verbose_name='Описание кандидата')

    election = models.ForeignKey(Election, verbose_name='Голосование', related_name='candidates', on_delete=models.CASCADE)

    def __str__(self):
        return '{} {} | {}'.format(self.passport_series, self.passport_number, self.election.name)

    class Meta:
        verbose_name = 'Кандидат голосования'
        verbose_name_plural = 'кандидаты голосования'
        unique_together = ['passport_series', 'passport_number', 'election']
        ordering = ['election', 'passport_series', 'passport_number']


class Contract(models.Model):
    info = models.TextField(max_length=256, verbose_name='Информация о голосующем')
    masked_vote_private_key = models.BinaryField(max_length=2048, verbose_name='Ключ дешифрования для голосования')
    masked_check_public_key = models.BinaryField(max_length=2048, verbose_name='Ключ шифрования для проверки')
    signed_masked_vote_private_key = models.BinaryField(max_length=2048, verbose_name='Ключ дешифрования для голосования, подписанный избиркомом')

    sign_election = models.BinaryField(max_length=2048, verbose_name='Подпись избиркома')
    sign_voter = models.BinaryField(max_length=2048, verbose_name='Подпись голосующего')

    def __str__(self):
        return '{} {} | {}'.format(self.voter.passport_series, self.voter.passport_number, self.voter.election.name)

    class Meta:
        verbose_name = 'Контракт голосующих'
        verbose_name_plural = 'контракты голосующих'


class Vote(models.Model):
    pass
