from django.db import models


class Candidate(models.Model):
    pass


class Election(models.Model):
    name = models.CharField(max_length=128, verbose_name='Название голосования')
    description = models.TextField(max_length=1024, verbose_name='Описание голосования')

    start_date = models.DateTimeField(verbose_name='Дата начала голосования')
    end_date = models.DateTimeField(verbose_name='Дата окончания голосования')

    result = models.ForeignKey(Candidate, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return '{} - {} | {}'.format(self.start_date.strftime("%Y-%m-%d %H:%M:%S"), self.end_date.strftime("%Y-%m-%d %H:%M:%S"), self.name)

    class Meta:
        verbose_name = 'Голосование'
        verbose_name_plural = 'голосования'
        unique_together = ['name', 'start_date', 'end_date']
        ordering = ['start_date', 'end_date', 'name']


