import firebase_admin
from firebase_admin import credentials, messaging, firestore
import os
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

# Khởi tạo Firebase Admin SDK
try:
    # Tìm Firebase Credentials
    cred_path = os.path.join(settings.BASE_DIR, 'firebase-credentials.json')
    
    if not os.path.exists(cred_path):
        # Nếu file không tồn tại, tạo từ biến môi trường hoặc settings
        firebase_credentials = getattr(settings, 'FIREBASE_CREDENTIALS', None)
        if firebase_credentials:
            with open(cred_path, 'w') as f:
                json.dump(firebase_credentials, f)
    
    # Khởi tạo Firebase Admin SDK nếu chưa được khởi tạo
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Firebase Admin SDK: {str(e)}")

def get_user_fcm_tokens(user):
    """
    Lấy danh sách FCM token của một user từ Firestore
    """
    try:
        db = firestore.client()
        user_doc = db.collection('user_tokens').document(str(user.id)).get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return user_data.get('fcm_tokens', [])
        return []
    except Exception as e:
        logger.error(f"Error getting user FCM tokens: {str(e)}")
        return []

def send_push_notification(token, title, body, data=None):
    """
    Gửi push notification đến một FCM token
    """
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=data or {},
            token=token
        )
        
        response = messaging.send(message)
        logger.info(f"Push notification sent successfully: {response}")
        return True
    except Exception as e:
        logger.error(f"Error sending push notification: {str(e)}")
        return False

def send_chat_notification(recipient, sender, chat_group, message_content, message_id):
    """
    Gửi thông báo tin nhắn mới đến người nhận
    """
    # Lấy FCM tokens của người nhận
    tokens = get_user_fcm_tokens(recipient)
    
    if not tokens:
        logger.warning(f"No FCM tokens found for user {recipient.id}")
        return False
    
    # Chuẩn bị thông tin thông báo
    title = sender.get_full_name() or sender.username
    body = message_content[:100]  # Giới hạn nội dung hiển thị
    
    # Dữ liệu bổ sung cho client
    data = {
        'type': 'chat_message',
        'chat_id': str(chat_group.id),
        'message_id': str(message_id),
        'sender_id': str(sender.id),
        'sender_name': sender.username,
        'is_group': str(chat_group.is_group).lower(),
        'group_name': chat_group.name or ''
    }
    
    # Gửi thông báo đến mỗi token
    success_count = 0
    for token in tokens:
        if send_push_notification(token, title, body, data):
            success_count += 1
    
    logger.info(f"Sent chat notifications to {success_count}/{len(tokens)} devices for user {recipient.id}")
    return success_count > 0

def store_fcm_token(user_id, token):
    """
    Lưu trữ FCM token của user vào Firestore
    """
    try:
        db = firestore.client()
        user_ref = db.collection('user_tokens').document(str(user_id))
        
        # Lấy tokens hiện tại
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            tokens = user_data.get('fcm_tokens', [])
            
            # Thêm token mới nếu chưa có
            if token not in tokens:
                tokens.append(token)
                user_ref.update({'fcm_tokens': tokens})
        else:
            # Tạo mới document nếu chưa tồn tại
            user_ref.set({'fcm_tokens': [token]})
            
        logger.info(f"FCM token stored for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error storing FCM token: {str(e)}")
        return False

def remove_fcm_token(user_id, token):
    """
    Xóa FCM token của user khỏi Firestore
    """
    try:
        db = firestore.client()
        user_ref = db.collection('user_tokens').document(str(user_id))
        
        # Lấy tokens hiện tại
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            tokens = user_data.get('fcm_tokens', [])
            
            # Xóa token nếu có
            if token in tokens:
                tokens.remove(token)
                user_ref.update({'fcm_tokens': tokens})
                
        logger.info(f"FCM token removed for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error removing FCM token: {str(e)}")
        return False
