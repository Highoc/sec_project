from django.db import models


class Person(models.Model):
    first_name = models.CharField(max_length=32, verbose_name='Имя')
    last_name = models.CharField(max_length=32, verbose_name='Фамилия')
    patronymic = models.CharField(max_length=32, verbose_name='Отчество')

    birth_date = models.DateField(verbose_name='Дата рождения')
    address = models.CharField(max_length=128, verbose_name='Адрес прописки')

    passport_series = models.IntegerField(verbose_name='Серия паспорта')
    passport_number = models.IntegerField(verbose_name='Номер паспорта')

    signature_public_key = models.BinaryField(verbose_name='Публичный ключ личной ЭЦП')

    signature_i = models.BinaryField(max_length=2048, verbose_name='Государственная подпись, удостоверяющая верность данных')

    def __str__(self):
        return '{} {} - {} {}'.format(self.passport_series, self.passport_number, self.last_name, self.first_name)

    class Meta:
        verbose_name = 'Гражданин РФ'
        verbose_name_plural = 'cписок граждан РФ'
        unique_together = ['passport_series', 'passport_number']
