import threading
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging
import unicodedata
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

from rent_house.models import (
    User, Notification, NotificationType, PostType, Media
)
logger = logging.getLogger(__name__)

def send_notification_email_async(subject, context, recipient_email):
    def send_email_task():
        try:
            html_message = render_to_string('email/new_house_notification.html', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
                html_message=html_message,
                fail_silently=True
            )
            logger.info(f"Sent house notification email to {recipient_email}")
        except Exception as e:
            logger.error(f"Failed to send house notification email to {recipient_email}: {str(e)}")
    
    email_thread = threading.Thread(target=send_email_task)
    email_thread.daemon = True 
    email_thread.start()

def create_notification(user, content, notification_type, sender=None, related_object=None, url=None):
    if not user:
        return None
    if user == sender:
        return None
        
    notification = Notification.objects.create(
        user=user,
        content=content,
        type=notification_type,
        sender=sender,
        url=url
    )
    
    if related_object:
        content_type = ContentType.objects.get_for_model(related_object)
        notification.related_object_type = content_type
        notification.related_object_id = related_object.id
        notification.save(update_fields=['related_object_type', 'related_object_id'])
    
    try:
        ascii_content = unicodedata.normalize('NFKD', content).encode('ascii', 'ignore').decode('ascii')
        logger.info(f"Would send notification to user {user.id}: {ascii_content}")
    except Exception as e:
        logger.info(f"Would send notification to user {user.id}: [Unicode content]")
    
    return notification



def interaction_notification(sender, post):
    create_notification(
        user=post.author,
        content=f"{sender.get_full_name()} đã tương tác bài viết của bạn",
        notification_type=NotificationType.INTERACTION.value[0],
        sender=sender,
        related_object=post,
        url=f"/posts/{post.id}/"
    )

def post_for_followers_notification(sender, post):
    followers = User.objects.filter(
        following__followee=sender,
        following__is_following=True
    )
    
    post_type_display = post.type
    
    for pt_enum in PostType:
        if pt_enum.value[0] == post.type:
            post_type_display = pt_enum.value[1]
            break
        
    for follower in followers:
        create_notification(
            user=follower,
            content=f"{sender.get_full_name() or sender.username} đã đăng một bài {post_type_display} mới",
            notification_type=NotificationType.NEW_POST.value[0],
            sender=sender,
            related_object=post,
            url=f"/posts/{post.id}/"
        )

def follow_notification(sender, target_user):
    create_notification(
        user=target_user,
        content=f"{sender.get_full_name() or sender.username} đã theo dõi bạn",
        notification_type=NotificationType.FOLLOW.value[0],
        sender=sender,
        related_object=sender,
        url=f"/users/{sender.username}/"
    )

def rating_notification(sender, house):
    create_notification(
        user=house.owner,
        content=f"{sender.get_full_name() or sender.user.username} đã đánh giá nhà của bạn.",
        notification_type=NotificationType.RATING.value[0],
        sender=sender,
        related_object=house,
        url=f"/houses/{house.id}/"
    )

def reply_comment_notification(sender, parent, post_id, comment):
    create_notification(
        user=parent.author,
        content=f"{sender.get_full_name() or sender.username} đã phản hồi bình luận của bạn",
        notification_type=NotificationType.COMMENT.value[0],
        sender=sender,
        related_object=comment,
        url=f"/posts/{post_id}/"
    )

def comment_notification(sender, post_author, post_id, comment):
    create_notification(
        user=post_author,
        content=f"{sender.get_full_name() or sender.username} đã bình luận về bài viết của bạn",
        notification_type=NotificationType.COMMENT.value[0],
        sender=sender,
        related_object=comment,
        url=f"/posts/{post_id}/"
    )

def house_notification(sender, house):
    followers = User.objects.filter(
        following__followee=sender,
        following__is_following=True
    )
    
    content = f"{sender.get_full_name() or sender.username} vừa đăng tin nhà mới: {house.title or house.address}"
    
    for follower in followers:
        create_notification(
            user=follower,
            content=content,
            notification_type=NotificationType.NEW_HOUSE.value[0],
            sender=sender,
            related_object=house,
            url=None  
        )
        
        if follower.email.endswith('@riikon.net'):
            continue

        subject = f'Thông báo có nhà cho thuê mới từ {sender.get_full_name() or sender.username}'
        
        house_type_display = house.get_type_display() if hasattr(house, 'get_type_display') else house.type
        
        # Get house images (up to 3)
        from django.contrib.contenttypes.models import ContentType
        house_content_type = ContentType.objects.get_for_model(house)
        house_images = Media.objects.filter(
            content_type=house_content_type,
            object_id=house.id,
            media_type='image'
        )[:3]
        
        image_urls = [img.url for img in house_images]
        
        # Calculate additional fees if any
        additional_fees = {}
        if house.water_price:
            additional_fees['Nước'] = f"{house.water_price:,} VNĐ"
        if house.electricity_price:
            additional_fees['Điện'] = f"{house.electricity_price:,} VNĐ"
        if house.internet_price:
            additional_fees['Internet'] = f"{house.internet_price:,} VNĐ"
        if house.trash_price:
            additional_fees['Rác'] = f"{house.trash_price:,} VNĐ"
        
        context = {
            'recipient_name': follower.get_full_name() or follower.username,
            'sender_name': sender.get_full_name() or sender.username,
            'house_title': house.title or "Nhà cho thuê mới",
            'house_address': house.address,
            'house_type': house_type_display,
            'house_price': house.base_price,
            'house_max_people': house.max_people,
            'house_area': house.area,
            'house_deposit': house.deposit,
            'house_lat': house.latitude,
            'house_lon': house.longitude,
            'additional_fees': additional_fees,
            'house_images': image_urls,
            'house_id': house.id,
            'site_url': settings.SITE_URL
        }
        
        send_notification_email_async(subject, context, follower.email)

# def send_notification_to_device(notification):
#     try:
#         sender_info = notification.sender.id if notification.sender else 'system'
#         ascii_content = unicodedata.normalize('NFKD', notification.content).encode('ascii', 'ignore').decode('ascii')
#         logger.info(
#             f"Would send push notification: "
#             f"to={notification.user.id}, "
#             f"from={sender_info}, "
#             f"content={ascii_content}"
#         )
#     except Exception as e:
#         logger.info(f"Would send push notification to user {notification.user.id} [Unicode content]")
#     return True

# @receiver(post_save, sender=Follow)
# def follow_notification(sender, instance, created, **kwargs):
#     """Thông báo khi có người theo dõi bạn"""
#     # Thay đổi: chỉ thông báo khi is_following=True, bất kể đó là lần đầu hay không
#     if instance.is_following:
#         # Kiểm tra xem đã có thông báo follow gần đây chưa để tránh spam
#         recent_notification = Notification.objects.filter(
#             user=instance.followee,
#             sender=instance.follower,
#             type=NotificationType.FOLLOW.value[0]
#         ).order_by('-created_at').first()
        
#         # Nếu chưa có thông báo hoặc thông báo cuối cùng đã cách đây lâu (hoặc đã bị unfollow rồi follow lại)
#         if not recent_notification or not created:
#             follower = instance.follower
#             followee = instance.followee
            
#             content = f"{follower.first_name or follower.username} đã theo dõi bạn"
#             url = f"/users/{follower.username}/"
            
#             create_notification(
#                 user=followee,
#                 content=content,
#                 notification_type=NotificationType.FOLLOW.value[0],
#                 sender=follower,
#                 related_object=follower,
#                 url=url
#             )

# @receiver(post_save, sender=Post)
# def post_notification(sender, instance, created, **kwargs):
#     """Thông báo khi người bạn theo dõi đăng bài mới"""
#     if created:
#         author = instance.author
#         followers = User.objects.filter(
#             following__followee=author,
#             following__is_following=True
#         )
        
#         post_type_display = dict(PostType._value2member_map_)[instance.type].value[1]
#         content = f"{author.first_name or author.username} đã đăng một bài {post_type_display} mới"
#         url = f"/posts/{instance.id}/"
        
#         for follower in followers:
#             create_notification(
#                 user=follower,
#                 content=content,
#                 notification_type=NotificationType.NEW_POST.value[0],
#                 sender=author,
#                 related_object=instance,
#                 url=url
#             )

# @receiver(post_save, sender=House)
# def house_notification(sender, instance, created, **kwargs):
#     """Thông báo khi người bạn theo dõi đăng tin nhà mới"""
#     if created:
#         owner = instance.owner
#         followers = User.objects.filter(
#             following__followee=owner,
#             following__is_following=True
#         )
        
#         content = f"{owner.first_name or owner.username} vừa đăng tin nhà mới: {instance.title or instance.address}"
#         url = f"/houses/{instance.id}/"
        
#         for follower in followers:
#             create_notification(
#                 user=follower,
#                 content=content,
#                 notification_type=NotificationType.NEW_POST.value[0],
#                 sender=owner,
#                 related_object=instance,
#                 url=url
#             )

# @receiver(post_save, sender=Comment)
# def comment_notification(sender, instance, created, **kwargs):
#     """Thông báo khi có người bình luận bài viết hoặc phản hồi bình luận của bạn"""
#     if created:
#         commenter = instance.author
        
#         # Nếu là phản hồi bình luận
#         if instance.parent:
#             parent_author = instance.parent.author
#             post = instance.post
            
#             # Thông báo cho người bình luận ban đầu
#             if parent_author != commenter:
#                 content = f"{commenter.first_name or commenter.username} đã phản hồi bình luận của bạn"
#                 url = f"/posts/{post.id}/"
                
#                 create_notification(
#                     user=parent_author,
#                     content=content,
#                     notification_type=NotificationType.COMMENT.value[0],
#                     sender=commenter,
#                     related_object=instance,
#                     url=url
#                 )
        
#         # Thông báo cho chủ bài viết
#         post_author = instance.post.author
#         if post_author != commenter and (not instance.parent or instance.parent.author != post_author):
#             content = f"{commenter.first_name or commenter.username} đã bình luận về bài viết của bạn"
#             url = f"/posts/{instance.post.id}/"
            
#             create_notification(
#                 user=post_author,
#                 content=content,
#                 notification_type=NotificationType.COMMENT.value[0],
#                 sender=commenter,
#                 related_object=instance,
#                 url=url
#             )

# @receiver(post_save, sender=Interaction)
# def interaction_notification(sender, instance, created, **kwargs):
#     """Thông báo khi có người tương tác với bài viết của bạn"""
#     # Thay đổi: Chỉ thông báo khi type='like', bất kể đã like trước đó hay chưa
#     if instance.type == 'like':
#         user = instance.user
#         post = instance.post
#         post_author = post.author
        
#         if post_author != user:
#             # Kiểm tra xem đã có thông báo like gần đây chưa để tránh spam
#             recent_notification = Notification.objects.filter(
#                 user=post_author,
#                 sender=user,
#                 type=NotificationType.INTERACTION.value[0],
#                 related_object_type=ContentType.objects.get_for_model(Post),
#                 related_object_id=post.id
#             ).order_by('-created_at').first()
            
#             # Nếu chưa có thông báo hoặc thông báo cuối là dislike/none
#             if not recent_notification:
#                 content = f"{user.first_name or user.username} đã thích bài viết của bạn"
#                 url = f"/posts/{post.id}/"
                
#                 create_notification(
#                     user=post_author,
#                     content=content,
#                     notification_type=NotificationType.INTERACTION.value[0],
#                     sender=user,
#                     related_object=post,
#                     url=url
#                 )

# @receiver(post_save, sender=Rate)
# def rating_notification(sender, instance, created, **kwargs):
#     """Thông báo khi có người đánh giá nhà của bạn"""
#     if created:
#         rater = instance.user
#         house = instance.house
#         owner = house.owner
        
#         if owner != rater:
#             stars = "★" * instance.star + "☆" * (5 - instance.star)
#             content = f"{rater.first_name or rater.username} đã đánh giá nhà của bạn {stars}"
#             url = f"/houses/{house.id}/"
            
#             create_notification(
#                 user=owner,
#                 content=content,
#                 notification_type=NotificationType.INTERACTION.value[0],
#                 sender=rater,
#                 related_object=house,
#                 url=url
#             )

# @receiver(post_save, sender=Message)
# def message_notification(sender, instance, created, **kwargs):
#     """Xử lý sự kiện tin nhắn mới (không tạo bản ghi Notification)"""
#     if created and not instance.is_system_message and not instance.is_removed:
#         chat_group = instance.chat_group
#         sender_user = instance.sender
        
#         # Lấy tất cả thành viên trừ người gửi
#         recipients = chat_group.members.exclude(id=sender_user.id)
        
#         for recipient in recipients:
#             # Ghi log thông báo thay vì gửi qua Firebase
#             logger.info(
#                 f"Would send chat notification: "
#                 f"to={recipient.id}, "
#                 f"from={sender_user.id}, "
#                 f"chat={chat_group.id}, "
#                 f"content={instance.content[:30]}..."
#             )