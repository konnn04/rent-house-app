from django.urls import path
from rent_house import views


urlpatterns = [
    path('', views.index, name='index'),
]


