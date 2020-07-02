from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import btlship.routing 

application = ProtocolTypeRouter ({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            btlship.routing.websocket_urlpatterns
        )
    ),
})