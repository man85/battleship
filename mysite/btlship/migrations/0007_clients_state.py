# Generated by Django 2.2.1 on 2020-06-10 18:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('btlship', '0006_auto_20200602_1738'),
    ]

    operations = [
        migrations.AddField(
            model_name='clients',
            name='state',
            field=models.CharField(max_length=30, null=True),
        ),
    ]
