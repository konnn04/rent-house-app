from django.core.management.base import BaseCommand
from rent_house.telegram_utils import send_telegram_message, send_error_to_telegram, debug_message
import logging

logger = logging.getLogger('rent_house')

class Command(BaseCommand):
    help = 'Test the Telegram notification system'

    def handle(self, *args, **options):
        self.stdout.write('Testing Telegram notifications...')
        
        # Test basic message
        result = send_telegram_message("🔹 Test message from Rent House App")
        self.stdout.write(self.style.SUCCESS('Basic message sent') if result else self.style.ERROR('Failed to send basic message'))
        
        # Test debug levels
        debug_message("This is an info message", "INFO")
        debug_message("This is a warning message", "WARNING")
        debug_message("This is an error message", "ERROR")
        debug_message("This is a success message", "SUCCESS")
        
        # Test error reporting
        try:
            # Simulate an error
            raise ValueError("This is a test error")
        except Exception as e:
            result = send_error_to_telegram(e, "Testing error reporting")
            self.stdout.write(self.style.SUCCESS('Error report sent') if result else self.style.ERROR('Failed to send error report'))
        
        # Test logger integration
        logger.info("This is a test info log (not sent to Telegram)")
        logger.error("This is a test error log (should appear in Telegram)")
        
        self.stdout.write(self.style.SUCCESS('All tests completed'))
