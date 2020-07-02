from  django.db import models

# Create your models here.
class GroupsUsers(models.Model):
    user1 = models.CharField(max_length=30)
    user2 = models.CharField(max_length=30)

class Games(models.Model):
    user = models.CharField(max_length=30)
    userFirst= models.BooleanField(default=False)
    
class Clients(models.Model):
    user = models.CharField(max_length=30)
    channel_name= models.CharField(max_length=30)
    idGame = models.ForeignKey(Games,on_delete=models.PROTECT,null=True)
    state = models.CharField(max_length=30,null=True)
class RequestToGame(models.Model):
    fromUser = models.CharField(max_length=30)
    toUser = models.CharField(max_length=30)

    