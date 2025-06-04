from django.core.management.base import BaseCommand
from oauth2_provider.models import Application
from django.contrib.auth import get_user_model

from dotenv import load_dotenv
import os

load_dotenv()

User = get_user_model()

class Command(BaseCommand):
    help = 'Tạo ứng dụng OAuth2 cho React Native'

    def handle(self, *args, **kwargs):
        try:
            admin_user = User.objects.filter(is_superuser=True).first()
            
            if not admin_user:
                self.stdout.write(self.style.ERROR('Chưa có ADMIN'))
                return
            
            app_exists = Application.objects.filter(name="Rent House App").exists()
            
            if app_exists:
                self.stdout.write(self.style.WARNING('Đã tồn tại ứng dụng OAuth2 app'))
                return
            
            app = Application.objects.create(
                name=os.getenv('NAME_APP', 'Rent House App'),
                user=admin_user,
                client_type=Application.CLIENT_PUBLIC,
                authorization_grant_type=Application.GRANT_PASSWORD,
                redirect_uris="",  
                client_id=os.getenv('CLIENT_ID_APP', 'renthouseclient'),
                client_secret=os.getenv('CLIENT_SECRET_APP', 'renthouseclientsecret'),
                skip_authorization=True
            )
            
            self.stdout.write(self.style.SUCCESS(f'Đã tạo thành công ứng dụng OAuth2  client_id={app.client_id}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Lỗi: {str(e)}'))
