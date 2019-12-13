# Generated by Django 3.0 on 2019-12-13 20:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('election', '0006_contract_vote_voter'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contract',
            name='voter',
        ),
        migrations.RemoveField(
            model_name='vote',
            name='voter',
        ),
        migrations.AddField(
            model_name='voter',
            name='contract',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='voter_contract', to='election.Voter', verbose_name='Контракт'),
        ),
        migrations.AddField(
            model_name='voter',
            name='vote',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='voter_vote', to='election.Voter', verbose_name='Голос'),
        ),
    ]
