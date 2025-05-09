from django.apps import AppConfig
from django.db.models.signals import post_migrate
import logging

logger = logging.getLogger(__name__)

class RentHouseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rent_house'

    def ready(self):
        # Khi ứng dụng đã sẵn sàng, đăng ký signals
        post_migrate.connect(self.create_default_oauth_app, sender=self)
        
        # Initialize Telegram notification
        from django.conf import settings
        if getattr(settings, 'TELEGRAM_DEBUG_ENABLED', False):
            from rent_house.telegram_utils import send_telegram_message
            try:
                send_telegram_message("🚀 <b>Rent House App Server Started</b>")
                logger.info("Telegram notifications initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Telegram notifications: {str(e)}")

    def create_default_oauth_app(self, **kwargs):
        # Tạo ứng dụng OAuth2 mặc định nếu chưa tồn tại
        from django.core.management import call_command
        call_command('create_oauth_app')
