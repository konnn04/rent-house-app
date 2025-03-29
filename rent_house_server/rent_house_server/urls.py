from django.contrib import admin
from django.urls import include, path
from oauth2_provider import urls as oauth2_urls
from django.contrib.auth.decorators import login_required

# admin.site.login = login_required(admin.site.login)

urlpatterns = [
    path('', include('rent_house.urls')),
    path('o/', include(oauth2_urls)),
    path('admin/', admin.site.urls),
]
