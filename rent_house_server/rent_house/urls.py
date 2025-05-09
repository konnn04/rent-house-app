from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
# Home page
router.register(r'', views.NewFeedViewSet, basename='new-feed')
router.register(r'houses', views.HouseViewSet, basename='house')
router.register(r'rooms', views.RoomViewSet, basename='room')
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'rates', views.RateViewSet, basename='rate')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'follows', views.FollowViewSet, basename='follow')
router.register(r'rentals', views.RoomRentalViewSet, basename='room-rental')
router.register(r'chats', views.ChatGroupViewSet, basename='chat-group')
router.register(r'messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('api/resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    path('api/check-verification-status/', views.CheckVerificationStatusView.as_view(), name='check-verification-status'),
]


