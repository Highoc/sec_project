# Generated by Django 3.0 on 2019-12-20 11:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('election', '0009_contract_info'),
    ]

    operations = [
        migrations.AddField(
            model_name='vote',
            name='candidate',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='votes', to='election.Candidate'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='candidate_signed',
            field=models.BinaryField(default=b'', verbose_name='candidate, подписанный голосующим'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='check_public_key',
            field=models.BinaryField(default=b'', verbose_name='Ключ шифрования(открытый) для проверки'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='election',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='votes', to='election.Election'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='vote_private_key',
            field=models.BinaryField(default=b'', verbose_name='Ключ дешифрования(закрытый) для голосования'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='vote_private_key_signed',
            field=models.BinaryField(default=b'', verbose_name='vote_private_key, подписанный избиркомом'),
            preserve_default=False,
        ),
    ]
