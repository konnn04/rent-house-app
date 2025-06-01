from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rent_house.admin_views import admin_dashboard

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
# Home page
router.register(r'', views.NewFeedViewSet, basename='new-feed')
router.register(r'houses', views.HouseViewSet, basename='house')
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'rates', views.RateViewSet, basename='rate')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'follows', views.FollowViewSet, basename='follow')
router.register(r'chats', views.ChatGroupViewSet, basename='chat-group')
router.register(r'messages', views.MessageViewSet, basename='message')
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'identity-verification', views.IdentityVerificationViewSet, basename='identity-verification')

urlpatterns = [
    path('ping/', views.ping_view, name='ping'),
    path('', include(router.urls)),
    # Endpoints quản lý người dùng
    path('register/', views.RegisterView.as_view(), name='register'),
    path('pre-register/', views.PreRegisterView.as_view(), name='pre-register'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    path('check-verification-status/', views.CheckVerificationStatusView.as_view(), name='check-verification-status'),
    # Endpoints đổi mật khẩu
    path('reset-password/<str:token>/', views.WebPasswordResetView.as_view(), name='web-password-reset'),
    path('request-password-reset/', views.RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('password-reset/', views.PasswordResetView.as_view(), name='password-reset'),
    
]


