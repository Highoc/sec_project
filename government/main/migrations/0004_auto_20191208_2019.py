# Generated by Django 3.0 on 2019-12-08 20:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20191208_1907'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='person',
            options={'verbose_name': 'Гражданин РФ', 'verbose_name_plural': 'Список граждан РФ'},
        ),
        migrations.AlterField(
            model_name='person',
            name='signature_i',
            field=models.BinaryField(max_length=2048, verbose_name='Государственная подпись, удостоверяющая верность данных'),
        ),
    ]
