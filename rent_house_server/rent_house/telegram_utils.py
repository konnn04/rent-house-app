import requests
import logging
import traceback
from django.conf import settings
from functools import wraps

logger = logging.getLogger(__name__)

def send_telegram_message(message, parse_mode='HTML'):
    """
    Send message to Telegram chat
    """
    try:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID
        
        if not bot_token or not chat_id:
            logger.warning("Telegram credentials not configured properly")
            return False
            
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True
        }
        
        response = requests.post(url, data=data)
        response.raise_for_status()
        
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {str(e)}")
        return False

def send_error_to_telegram(e, additional_info=None):
    """
    Send exception details to Telegram
    """
    try:
        error_message = f"⚠️ <b>ERROR</b>\n\n"
        error_message += f"<b>Type:</b> {type(e).__name__}\n"
        error_message += f"<b>Message:</b> {str(e)}\n"
        
        if additional_info:
            error_message += f"\n<b>Additional Info:</b>\n{additional_info}\n"
        
        # Get traceback
        tb = traceback.format_exc()
        if tb and tb != "NoneType: None\n":
            error_message += f"\n<b>Traceback:</b>\n<pre>{tb[:3000]}</pre>"  # Limit traceback length
            
        return send_telegram_message(error_message)
    except Exception as ex:
        logger.error(f"Failed to send error to Telegram: {str(ex)}")
        return False

def notify_telegram(func=None, message=None):
    """
    Decorator to notify Telegram about function execution.
    Can be used as @notify_telegram or @notify_telegram(message="Custom message")
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            func_name = func.__name__
            custom_message = message or f"Function {func_name} executed"
            
            try:
                result = func(*args, **kwargs)
                send_telegram_message(f"✅ {custom_message}")
                return result
            except Exception as e:
                error_message = f"❌ {custom_message} failed"
                send_error_to_telegram(e, error_message)
                raise
                
        return wrapper
        
    if func:
        return decorator(func)
    return decorator

def debug_message(message, level="INFO"):
    """
    Send debug message to Telegram with appropriate emoji based on level
    """
    level = level.upper()
    emoji_map = {
        "INFO": "ℹ️",
        "WARNING": "⚠️",
        "ERROR": "❌",
        "SUCCESS": "✅",
        "DEBUG": "🔍"
    }
    
    emoji = emoji_map.get(level, "🔹")
    formatted_message = f"{emoji} <b>{level}</b>: {message}"
    
    return send_telegram_message(formatted_message)
