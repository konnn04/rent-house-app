from .pagination import SmallPagePagination
from .user import UserViewSet
from .house import HouseViewSet
from .post import PostViewSet
from .comment import CommentViewSet
from .feed import NewFeedViewSet
from .room import RoomViewSet
from .rate import RateViewSet
from .notification import NotificationViewSet
from .follow import FollowViewSet
from .room_rental import RoomRentalViewSet
from .chat import ChatGroupViewSet, MessageViewSet
from .auth import RegisterView, VerifyEmailView, ResendVerificationView, CheckVerificationStatusView

# Export all views to maintain backward compatibility
__all__ = [
    'SmallPagePagination',
    'UserViewSet',
    'HouseViewSet',
    'PostViewSet',
    'CommentViewSet', 
    'NewFeedViewSet',
    'RoomViewSet',
    'RateViewSet',
    'NotificationViewSet',
    'FollowViewSet',
    'RoomRentalViewSet',
    'ChatGroupViewSet',
    'MessageViewSet',
    'RegisterView',
    'VerifyEmailView',
    'ResendVerificationView',
    'CheckVerificationStatusView'
]
