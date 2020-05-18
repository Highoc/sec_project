# Generated by Django 3.0 on 2019-12-20 12:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('election', '0010_auto_20191220_1106'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='vote',
            options={'verbose_name': 'Голос', 'verbose_name_plural': 'голоса'},
        ),
        migrations.RemoveField(
            model_name='contract',
            name='masked_check_public_key',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='masked_vote_private_key',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='sign_election',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='sign_voter',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='signed_masked_vote_private_key',
        ),
        migrations.AddField(
            model_name='contract',
            name='check_public_key_masked',
            field=models.BinaryField(default=b'', verbose_name='Ключ шифрования(открытый) для проверки, замаскированный секретным множителем избирателя'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='contract',
            name='k_signed_by_election',
            field=models.BinaryField(default=b'', verbose_name='Подпись контракта избиркомом'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='contract',
            name='k_signed_by_voter',
            field=models.BinaryField(default=b'', verbose_name='Подпись контракта голосующим'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='contract',
            name='vote_private_key_masked',
            field=models.BinaryField(default=b'', verbose_name='Ключ дешифрования(закрытый) для голосования, замаскированный секретным множителем избирателя'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='contract',
            name='vote_private_key_masked_signed',
            field=models.BinaryField(default=b'', verbose_name='Ключ дешифрования(закрытый) для голосования, замаскированный секретным множителем избирателя, подписанный избиркомом'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='contract',
            name='info',
            field=models.TextField(max_length=256, verbose_name='Идентификационные данные избирателя'),
        ),
    ]
