# Generated by Django 3.0 on 2019-12-13 12:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('election', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='election',
            name='description',
            field=models.TextField(max_length=1024, verbose_name='Описание голосования'),
        ),
    ]
