# Generated by Django 3.0 on 2019-12-20 12:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('election', '0011_auto_20191220_1234'),
    ]

    operations = [
        migrations.AddField(
            model_name='contract',
            name='election',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='contracts', to='election.Election'),
            preserve_default=False,
        ),
    ]
