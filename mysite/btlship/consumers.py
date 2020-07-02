from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
import json, os
from .models import GroupsUsers, Clients, RequestToGame, Games

class WsConsumer(WebsocketConsumer):
    def connect(self):
        if self.scope["user"].is_authenticated:
           self.group_name='common'
           async_to_sync(self.channel_layer.group_add)(
               self.group_name,
               self.channel_name
           )
           ch = self.channel_name
           Clients.objects.filter(user=self.scope["user"]).delete()
           Clients.objects.create(channel_name=self.channel_name,user=self.scope["user"])           
           async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {"type":"send.message",
                 "message":json.dumps({"requestType":"newuser",
                                       "user":self.scope["user"].username
                                     })
                }
           )
           self.accept()
    
    def disonnect(self,close_code):
        Clients.objects.filter(channel_name=self.channel_name).delete()
        Clients.objects.filter(user=self.scope["user"]).delete()
    # send to user
    def send_message(self,event):
        message= event['message']
        self.send(message)
        
    def receive(self, text_data):
        self.send(text_data)
        text_data_json=json.loads(text_data)
        requestType=text_data_json['requestType']
        sender=text_data_json['sender']
        if (requestType == 'outgoing'):
            users=text_data_json['users']
            for u in users:
                channelName=Clients.objects.filter(user=u).first().channel_name
                async_to_sync(self.channel_layer.send)(
                   channelName,{
                     "type":"send.message",
                     "message":json.dumps({
                        "requestType":"incoming",
                        "sender":self.scope["user"].username,
                        "receiver":u
                     })
                })
                RequestToGame.objects.filter(fromUser=self.scope["user"]).filter(toUser=u).delete()
                RequestToGame.objects.create(fromUser=self.scope["user"],toUser=u)
        elif (requestType == 'confirming'):
           receiver=text_data_json['receiver']
           if (RequestToGame.objects.filter(toUser=self.scope["user"]).filter(fromUser=receiver).count()==0):
              return 
           GroupsUsers.objects.filter(user1=self.scope["user"]).delete()
           GroupsUsers.objects.filter(user2=self.scope["user"]).delete()
           GroupsUsers.objects.filter(user1=receiver).delete()
           GroupsUsers.objects.filter(user2=receiver).delete()
           GroupsUsers.objects.create(user1=self.scope["user"],user2=receiver)
           GroupsUsers.objects.create(user2=self.scope["user"],user1=receiver)
           game=Games.objects.create(user=self.scope["user"])
           userClient=Clients.objects.filter(user=self.scope["user"]).first()
           userClient.idGame=game
           userClient.save()
           channelName=userClient.channel_name
           directory=os.path.dirname(os.path.abspath(__file__))
           f=open(directory+'/btlship.body')
           async_to_sync(self.channel_layer.send)(
                         channelName,{
                                    "type":"send.message",
                                    "message":json.dumps({
                                             "requestType":"startGame",
                                             "newBody":f.read()
                                              })
                        })
           f.close()
           f=open(directory+'/btlship.body')
           userClient=Clients.objects.filter(user=receiver).first()
           userClient.idGame=game
           userClient.save()
           channelName=userClient.channel_name
           async_to_sync(self.channel_layer.send)(
                         channelName,{
                                    "type":"send.message",
                                    "message":json.dumps({
                                             "requestType":"startGame",
                                             "newBody":f.read()
                                              })
                        })
           f.close()
        elif(requestType=='shipsArePlaced'):
           userClient=Clients.objects.filter(user=self.scope["user"]).first()
           userClient.state='shipsArePlaced'
           userClient.save()
           channelName=userClient.channel_name
           idGame=userClient.idGame
           if (idGame==''):
              return
           game=Games.objects.filter(id=idGame.id).first()
           opponent=GroupsUsers.objects.filter(user1=self.scope["user"]).first().user2
           opponentClient=Clients.objects.filter(user=opponent).first()
           oppChannelName=opponentClient.channel_name
           if (opponentClient.state=='ShipsArePlaced'):
              async_to_sync(self.channel_layer.send)(
                                     oppChannelName,{
                                                    "type":"send.message",
                                                    "message":json.dumps({
                                                    "requestType":"yourMove"  })})
           else:
              async_to_sync(self.channel_layer.send)(
                                     oppChannelName,{
                                        "type":"send.message",
                                        "message":json.dumps({
                                        "requestType":"yourOpponentPlacedShips"  })})
           if (game.userFirst):
              async_to_sync(self.channel_layer.send)(
                       oppChannelName,{
                           "type":"send.message",
                           "message":json.dumps({
                                     "requestType":"yourMove"  })})
           if not(game.userFirst):
              game.user=self.scope["user"].username
              game.userFirst=True
              game.save()
        elif(requestType=='shot')or(requestType=='wounded')or(requestType=='shipSank')or(requestType=='shotPast')or(requestType=='oppField'):
           game = Games.objects.filter(id=Clients.objects.filter(user=self.scope["user"]).first().idGame.id).first()
           opponent=GroupsUsers.objects.filter(user1=self.scope["user"]).first().user2
           opponentClient=Clients.objects.filter(user=opponent).first()
           oppChannelName=opponentClient.channel_name
           async_to_sync(self.channel_layer.send)(
                                     oppChannelName,{
                                                    "type":"send.message",
                                                    "message":text_data})
           if (requestType=='shotPast'):
             game.user=opponent
             game.save()