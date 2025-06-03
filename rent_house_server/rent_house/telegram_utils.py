import requests
import logging
import traceback
from django.conf import settings
from functools import wraps

logger = logging.getLogger(__name__)

def send_telegram_message(message, parse_mode='HTML'):
    try:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID
        
        if not bot_token or not chat_id:
            logger.warning("Telegram credentials not configured properly")
            return False
        
        # Telegram giới hạn độ dài tin nhắn là 4096 ký tự
        if len(message) > 4096: 
            logger.warning(f"Message too long ({len(message)} chars), truncating to 4096 chars")
            message = message[:4093] + "..."
            
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True
        }
        
        logger.info(f"Sending Telegram message to chat {chat_id}")
        response = requests.post(url, data=data)
        
        if response.status_code != 200:
            error_detail = f"Status: {response.status_code}"
            try:
                error_json = response.json()
                if 'description' in error_json:
                    error_detail += f", Description: {error_json['description']}"
            except:
                error_detail += f", Response: {response.text[:100]}"
                
            logger.error(f"Telegram API error: {error_detail}")
            
            if parse_mode == 'HTML' and 'can\'t parse entities' in response.text:
                logger.info("Attempting to send message without HTML parsing")
                return send_telegram_message(f"⚠️ Original message had invalid HTML. Raw message:\n\n{message}", parse_mode=None)
                
            return False
            
        logger.info("Telegram message sent successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {str(e)}")
        return False

def send_error_to_telegram(e, additional_info=None):
    try:
        error_message = f"⚠️ <b>ERROR</b>\n\n"
        error_message += f"<b>Type:</b> {type(e).__name__}\n"
        error_message += f"<b>Message:</b> {str(e)}\n"
        
        if additional_info:
            error_message += f"\n<b>Additional Info:</b>\n{additional_info}\n"
        
        tb = traceback.format_exc()
        if tb and tb != "NoneType: None\n":
            error_message += f"\n<b>Traceback:</b>\n<pre>{tb[:3000]}</pre>" 
            
        return send_telegram_message(error_message)
    except Exception as ex:
        logger.error(f"Failed to send error to Telegram: {str(ex)}")
        return False

def notify_telegram(func=None, message=None):
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

def escape_html(text):
    if text is None:
        return ""
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
