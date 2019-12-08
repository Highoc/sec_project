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

    signature_i = models.IntegerField(verbose_name='Государственная подпись, удостоверяющая верность данных')

    def __str__(self):
        return '{} {} - {} {}'.format(self.passport_series, self.passport_number, self.last_name, self.first_name)
    '''
    @classmethod
    def create(cls, ):
        person = cls(first_name, last_name, patronymic, birth_date, address, passport_series, passport_number=)
        return person
    '''

    class Meta:
        verbose_name = 'Гражданин РФ'
        verbose_name_plural = 'Граждане РФ'
        unique_together = ['passport_series', 'passport_number']
