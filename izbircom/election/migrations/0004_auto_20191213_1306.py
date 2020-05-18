# Generated by Django 3.0 on 2019-12-13 13:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('election', '0003_auto_20191213_1226'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='candidate',
            options={'ordering': ['election', 'passport_series', 'passport_number'], 'verbose_name': 'Кандидат голосования', 'verbose_name_plural': 'кандидаты голосования'},
        ),
        migrations.AlterModelOptions(
            name='election',
            options={'ordering': ['start_date', 'end_date', 'name'], 'verbose_name': 'Голосование', 'verbose_name_plural': 'голосования'},
        ),
        migrations.AddField(
            model_name='candidate',
            name='description',
            field=models.TextField(default=' ', max_length=1024, verbose_name='Описание кандидата'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='candidate',
            name='election',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='candidates', to='election.Election', verbose_name='Голосование'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='candidate',
            name='passport_number',
            field=models.IntegerField(default=1111, verbose_name='Номер паспорта кандидата'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='candidate',
            name='passport_series',
            field=models.IntegerField(default=1111, verbose_name='Серия паспорта кандидата'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='election',
            name='result',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='winner', to='election.Candidate'),
        ),
        migrations.AlterUniqueTogether(
            name='candidate',
            unique_together={('passport_series', 'passport_number', 'election')},
        ),
    ]