from django.db import models


class Election(models.Model):
    name = models.CharField(max_length=128, verbose_name='Название выборов')
    description = models.TextField(max_length=1024, verbose_name='Описание выборов')

    start_date = models.DateTimeField(verbose_name='Дата начала выборов')
    end_date = models.DateTimeField(verbose_name='Дата окончания выборов')

    is_finished = models.BooleanField(default=False, verbose_name='Голосование закончено?')
    is_checked = models.BooleanField(default=False, verbose_name='Проверка закончена?')

    def __str__(self):
        return '{} - {} | {}'.format(self.start_date.strftime("%Y-%m-%d %H:%M:%S"), self.end_date.strftime("%Y-%m-%d %H:%M:%S"), self.name)

    class Meta:
        verbose_name = 'Голосование'
        verbose_name_plural = 'голосования'
        unique_together = ['name', 'start_date', 'end_date']
        ordering = ['start_date', 'end_date', 'name']


class Voter(models.Model):
    first_name = models.CharField(max_length=32, verbose_name='Имя голосующего')
    last_name = models.CharField(max_length=32, verbose_name='Фамилия голосующего')
    patronymic = models.CharField(max_length=32, verbose_name='Отчество голосующего')
    passport_series = models.IntegerField(verbose_name='Серия паспорта голосующего')
    passport_number = models.IntegerField(verbose_name='Номер паспорта голосующего')

    signature_public_key = models.BinaryField(verbose_name='Публичный ключ личной ЭЦП голосующего')

    election = models.ForeignKey(Election, related_name='voters', on_delete=models.CASCADE, verbose_name='Голосование')
    contract = models.OneToOneField('election.Contract', related_name='voter', on_delete=models.CASCADE, null=True, verbose_name='Контракт')

    vote_private_key_masked_signed = models.BinaryField(verbose_name='Ключ дешифрования(закрытый) для голосования, замаскированный секретным множителем избирателя, подписанный избиркомом', null=True)

    def __str__(self):
        return '{} | {} {}'.format(self.election.id, self.passport_series, self.passport_number)

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
    info = models.TextField(max_length=256, verbose_name='Идентификационные данные избирателя')

    vote_private_key_masked = models.BinaryField(verbose_name='Ключ дешифрования(закрытый) для голосования, замаскированный секретным множителем избирателя')
    check_public_key_masked = models.BinaryField(verbose_name='Ключ шифрования(открытый) для проверки, замаскированный секретным множителем избирателя')
    vote_private_key_masked_signed = models.BinaryField(verbose_name='Ключ дешифрования(закрытый) для голосования, замаскированный секретным множителем избирателя, подписанный избиркомом')

    k_signed_by_election = models.BinaryField(verbose_name='Подпись контракта избиркомом')
    k_signed_by_voter = models.BinaryField(verbose_name='Подпись контракта голосующим')

    def __str__(self):
        return '{} {} | {}'.format(self.voter.passport_series, self.voter.passport_number, self.voter.election.name)

    class Meta:
        verbose_name = 'Контракт голосующих'
        verbose_name_plural = 'контракты голосующих'


class Vote(models.Model):
    election = models.ForeignKey(Election, related_name='votes', on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, related_name='votes', on_delete=models.CASCADE)

    vote_private_key = models.BinaryField(verbose_name='Ключ дешифрования(закрытый) для голосования')
    check_public_key = models.BinaryField(verbose_name='Ключ шифрования(открытый) для проверки')

    vote_private_key_signed = models.BinaryField(verbose_name='vote_private_key, подписанный избиркомом')
    candidate_crypted = models.BinaryField(verbose_name='candidate, защифрованный голосующим')

    is_checked = models.BooleanField(verbose_name='Голос проверен?', null=True)
    checked_by = models.ForeignKey(Voter, related_name='checker', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'Голосование {} | За {}'.format(self.election.id, self.candidate.id)

    class Meta:
        verbose_name = 'Голос'
        verbose_name_plural = 'голоса'


class CheckInfo(models.Model):
    v = models.OneToOneField(Vote, related_name='голос', on_delete=models.CASCADE)
    check_info_crypted = models.BinaryField(verbose_name='Зашифрованные данные для проверки')

    def __str__(self):
        return 'Проверка голоса {} | Голосование {}'.format(self.v.id, self.v.election.id)

    class Meta:
        verbose_name = 'Проверочная информация'
        verbose_name_plural = 'проверочные информации'