# Generated by Django 2.2.1 on 2020-05-13 15:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('btlship', '0003_clients'),
    ]

    operations = [
        migrations.CreateModel(
            name='RequestToGame',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fromUser', models.CharField(max_length=30)),
                ('toUser', models.CharField(max_length=30)),
            ],
        ),
    ]