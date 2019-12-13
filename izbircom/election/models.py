from django.db import models


class Candidate(models.Model):
    passport_series = models.IntegerField(verbose_name='Серия паспорта кандидата')
    passport_number = models.IntegerField(verbose_name='Номер паспорта кандидата')

    description = models.TextField(max_length=1024, verbose_name='Описание кандидата')

    election = models.ForeignKey('election.Election', verbose_name='Голосование', related_name='candidates', on_delete=models.CASCADE)

    def __str__(self):
        return '{} {} | {}'.format(self.passport_series, self.passport_number, self.election.name)

    class Meta:
        verbose_name = 'Кандидат голосования'
        verbose_name_plural = 'кандидаты голосования'
        unique_together = ['passport_series', 'passport_number', 'election']
        ordering = ['election', 'passport_series', 'passport_number']


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


class Contract(models.Model):
    pass

