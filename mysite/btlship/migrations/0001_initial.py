# Generated by Django 2.2.1 on 2020-05-05 15:24

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GroupsUsers',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user1', models.CharField(max_length=30)),
                ('user2', models.CharField(max_length=30)),
            ],
        ),
    ]
