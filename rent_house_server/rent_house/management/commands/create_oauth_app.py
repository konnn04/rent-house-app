from django.core.management.base import BaseCommand
from oauth2_provider.models import Application
from django.contrib.auth import get_user_model

from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

User = get_user_model()

class Command(BaseCommand):
    help = 'Tạo ứng dụng OAuth2 cho React Native'

    def handle(self, *args, **kwargs):
        try:
            # Tìm một user admin
            admin_user = User.objects.filter(is_superuser=True).first()
            
            if not admin_user:
                self.stdout.write(self.style.ERROR('Không tìm thấy user admin nào. Hãy tạo một tài khoản superuser trước.'))
                return
            
            # Kiểm tra xem đã có ứng dụng React Native chưa
            app_exists = Application.objects.filter(name="React Native App").exists()
            
            if app_exists:
                self.stdout.write(self.style.WARNING('Ứng dụng "React Native App" đã tồn tại.'))
                return
            
            # Tạo ứng dụng mới
            app = Application.objects.create(
                name=os.getenv('NAME_APP', 'React Native App'),
                user=admin_user,
                client_type=Application.CLIENT_PUBLIC,
                authorization_grant_type=Application.GRANT_PASSWORD,
                redirect_uris="",  # Không cần redirect URI cho password flow
                client_id=os.getenv('CLIENT_ID_APP', 'renthouseclient'),
                client_secret=os.getenv('CLIENT_SECRET_APP', 'renthouseclientsecret'),
                skip_authorization=True
            )
            
            self.stdout.write(self.style.SUCCESS(f'Đã tạo thành công ứng dụng OAuth2 cho React Native với client_id={app.client_id}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Lỗi: {str(e)}'))
