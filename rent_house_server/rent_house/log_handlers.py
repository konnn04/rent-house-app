import logging
from rent_house.telegram_utils import send_telegram_message

class TelegramLogHandler(logging.Handler):
    def __init__(self, min_level=logging.ERROR):
        super().__init__()
        self.setLevel(min_level)
        self.emoji_map = {
            logging.DEBUG: "🔍",
            logging.INFO: "ℹ️",
            logging.WARNING: "⚠️",
            logging.ERROR: "❌",
            logging.CRITICAL: "🚨"
        }
    
    def emit(self, record):
        try:
            level_emoji = self.emoji_map.get(record.levelno, "🔹")
            level_name = record.levelname
            
            message = f"{level_emoji} <b>{level_name}</b>: {record.getMessage()}"
            
            if record.exc_info:
                exc_type, exc_value, _ = record.exc_info
                message += f"\n\n<b>Exception:</b> {exc_type.__name__}: {exc_value}"
                
            send_telegram_message(message)
        except Exception:
            self.handleError(record)
