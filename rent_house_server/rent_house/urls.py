from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'houses', views.HouseViewSet, basename='house')

urlpatterns = [
    path('', include(router.urls)),
]


