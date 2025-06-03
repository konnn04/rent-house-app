from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging
import unicodedata

from rent_house.models import (
    User, Notification, NotificationType, PostType,
    Post, Comment, Follow, Interaction, House, Rate, Message
)
# Tạm thời bỏ import Firebase
# from rent_house.firebase_utils import send_push_notification, get_user_fcm_tokens, send_chat_notification

logger = logging.getLogger(__name__)

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

def send_notification_to_device(notification):
    """
    [TẠM BỎ] Gửi push notification đến thiết bị của người dùng
    """
    # Tạm thời chỉ ghi log thay vì gửi thông báo
    try:
        sender_info = notification.sender.id if notification.sender else 'system'
        ascii_content = unicodedata.normalize('NFKD', notification.content).encode('ascii', 'ignore').decode('ascii')
        logger.info(
            f"Would send push notification: "
            f"to={notification.user.id}, "
            f"from={sender_info}, "
            f"content={ascii_content}"
        )
    except Exception as e:
        logger.info(f"Would send push notification to user {notification.user.id} [Unicode content]")
    return True

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
    """Gửi thông báo đến những người theo dõi tác giả bài viết"""
    followers = User.objects.filter(
        following__followee=sender,
        following__is_following=True
    )
    post_type_map = dict(PostType._value2member_map_)
    post_type_enum = post_type_map.get(post.type)
    if post_type_enum:
        post_type_display = post_type_enum.value[1]
    else:
        post_type_display = str(post.type) 
        
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
        notification_type=NotificationType.INTERACTION.value[0],
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

# # Các receivers bắt sự kiện

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