from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q, Count, Avg, F
from enum import Enum
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from django.utils import timezone
import random
import string
from datetime import timedelta
from django.conf import settings

from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image

# ENUMS
class Role(Enum):
    ADMIN = 'admin', 'Quản trị viên'
    MODERATOR = 'moderator', 'Người quản lý'
    OWNER = 'owner', 'Chủ nhà'
    RENTER = 'renter', 'Người thuê trọ'
    COLLABORTOR = 'collaborator', 'Cộng tác viên'
    def __str__(self):
        return self.value[1]

class HouseType(Enum):
    HOUSE = 'house', 'Nhà riêng'
    APARTMENT = 'apartment', 'Chung cư'
    DORMITORY = 'dormitory', 'Ký túc xá'
    ROOM = 'room', 'Phòng trọ'
    def __str__(self):
        return self.value[1]

class PostType(Enum):
    GENERAL = 'general', 'Bài viết thông thường'
    RENTAL_LISTING = 'rental_listing', 'Cho thuê phòng trọ'
    SEARCH_LISTING = 'search_listing', 'Tìm phòng trọ'
    ROOMMATE = 'roommate', 'Tìm bạn ở ghép'
    def __str__(self):
        return self.value[1]

class NotificationType(Enum):
    NEW_POST = 'new_post', 'Bài viết mới'
    COMMENT = 'comment', 'Bình luận'
    FOLLOW = 'follow', 'Theo dõi'
    INTERACTION = 'interaction', 'Tương tác'
    # MESSAGE = 'message', 'Tin nhắn'
    NEW_HOUSE = 'new_house', 'Nhà mới'
    RATING = 'rating', 'Đánh giá'

class InteractionType(Enum):
    LIKE = 'like', 'Thích'
    DISLIKE = 'dislike', 'Không thích'
    NONE = 'none', 'Không tương tác'
    def __str__(self):
        return self.value[1]

class ReportType(Enum):
    SCAM = 'scam', 'Lừa đảo'
    VIOLATION = 'violation', 'Vi phạm quy định'
    OFFENSIVE = 'offensive', 'Phản cảm'
    HATE = 'hate', 'Gây thù ghét'
    OTHER = 'other', 'Khác'
    def __str__(self):
        return self.value[1]

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, help_text="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, help_text="Ngày cập nhật")
    class Meta:
        abstract = True

class Media(BaseModel):
    MEDIA_TYPES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    PURPOSE_TYPES = (
        ('avatar', 'User Avatar'),
        ('cover', 'Cover Photo'),
        ('gallery', 'Gallery Image'),
        ('attachment', 'Attachment'),
        ('id_front', 'ID Card Front'),
        ('id_back', 'ID Card Back'),
        ('id_selfie', 'ID Verification Selfie'),
    )
    url = models.URLField(help_text="Đường dẫn file")
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, db_index=True, help_text="Loại media")
    public_id = models.CharField(max_length=255, blank=True, null=True)
    purpose = models.CharField(max_length=20, choices=PURPOSE_TYPES, null=True, blank=True, db_index=True, help_text="Mục đích")
    thumbnail_url = models.URLField(null=True, blank=True)
    medium_url = models.URLField(null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(db_index=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['media_type', 'purpose']),
        ]
    def __str__(self):
        return f"{self.get_media_type_display()} for {self.content_object}"
    def get_url(self, size=None):
        if self.media_type != 'image' or not size:
            return self.url
        if 'res.cloudinary.com' not in self.url:
            return self.url
        parts = self.url.split('/upload/')
        if len(parts) != 2:
            return self.url
        base_url, image_part = parts
        transform = ''
        if size == 'thumbnail':
            transform = 'w_150,h_150,c_fill'
        elif size == 'medium':
            transform = 'w_500,c_scale'
        elif size == 'large':
            transform = 'w_1200,c_scale'
        elif isinstance(size, tuple) and len(size) == 2:
            transform = f'w_{size[0]},h_{size[1]},c_fill'
        return f"{base_url}/upload/{transform}/{image_part}"

    @classmethod
    def create_for_object(cls, obj, url, media_type='image', public_id=None):
        content_type = ContentType.objects.get_for_model(obj)
        return cls.objects.create(
            content_type=content_type,
            object_id=obj.id,
            url=url,
            media_type=media_type,
            public_id=public_id
        )
    @classmethod
    def get_for_object(cls, obj, media_type=None):
        content_type = ContentType.objects.get_for_model(obj)
        queryset = cls.objects.filter(content_type=content_type, object_id=obj.id)
        if media_type:
            queryset = queryset.filter(media_type=media_type)
        return queryset

class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True, null=True, db_index=True, help_text="Số điện thoại")
    role = models.CharField(
        max_length=20, 
        choices=[(role.value[0], role.name) for role in Role], 
        default=Role.RENTER.value[0],
        db_index=True,
        help_text="Vai trò"
    )
    address = models.CharField(blank=True, null=True, help_text="Địa chỉ", max_length=255)
    avatar = models.URLField(blank=True, null=True, help_text="Ảnh đại diện")
    media_files = GenericRelation(Media)
    class Meta:
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['role']),
        ]
    def __str__(self):
        return self.username
    def set_password(self, new_password):
        super().set_password(new_password)
        self.save()

    @classmethod
    def check_login(cls, username_or_email, password):
        try:
            user = cls.objects.get(
                Q(username=username_or_email) | Q(email=username_or_email)
            )
            if user.check_password(password):
                return user
            return None
        except cls.DoesNotExist:
            return None
    
    def get_avatar_url(self, size=None):
        if not self.avatar:
            return None
            
        if not size or 'res.cloudinary.com' not in self.avatar:
            return self.avatar
            
        parts = self.avatar.split('/upload/')
        if len(parts) != 2:
            return self.avatar
            
        base_url, image_part = parts
        
        transform = ''
        if size == 'thumbnail':
            transform = 'w_150,h_150,c_fill'
        elif size == 'medium':
            transform = 'w_500,c_scale'
        elif size == 'large':
            transform = 'w_1200,c_scale'
        elif isinstance(size, tuple) and len(size) == 2:
            transform = f'w_{size[0]},h_{size[1]},c_fill'
            
        return f"{base_url}/upload/{transform}/{image_part}"
    
    def set_avatar(self, image_file):
        
        
        if self.avatar and 'res.cloudinary.com' in self.avatar:
            delete_cloudinary_image(self.avatar)
            
        new_avatar_url = upload_image_to_cloudinary(image_file, folder="user_avatars")
        if new_avatar_url:
            self.avatar = new_avatar_url
            self.save(update_fields=['avatar'])
            return True
        return False
            
    def get_owned_houses(self):
        return self.houses.all()

    def has_submitted_identity(self):
        return hasattr(self, 'identity_verification')
    
    def is_identity_verified(self):
        if not self.has_submitted_identity():
            return False
        return self.identity_verification.is_verified
    
    def can_create_house(self):
        return self.role == Role.OWNER.value[0] and self.has_submitted_identity()

class IdentityVerification(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='identity_verification', help_text="Người dùng")
    id_number = models.CharField(max_length=20, verbose_name="Số CCCD/CMND", help_text="Số CCCD/CMND")
    is_verified = models.BooleanField(default=False, verbose_name="Đã được xác thực", db_index=True)
    admin_notes = models.TextField(null=True, blank=True, verbose_name="Ghi chú của admin")
    rejection_reason = models.TextField(null=True, blank=True, verbose_name="Lý do từ chối")
    media_files = GenericRelation(Media)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return f"Xác thực danh tính: {self.user.username}"
    
    def get_front_id_image(self):
        return self.media_files.filter(purpose='id_front').first()
    
    def get_back_id_image(self):
        return self.media_files.filter(purpose='id_back').first()
    
    def get_selfie_image(self):
        return self.media_files.filter(purpose='id_selfie').first()

class Follow(BaseModel):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following', help_text="Người theo dõi")
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers', help_text="Người được theo dõi")
    is_following = models.BooleanField(default=True, db_index=True, help_text="Đang theo dõi")
    class Meta:
        unique_together = ('follower', 'followee')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['follower', 'followee']),
        ]
    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"

class House(BaseModel):
    title = models.CharField(max_length=50, null=True, blank=True, db_index=True, help_text="Tiêu đề nhà")
    description = models.TextField(null=True, blank=True, help_text="Mô tả")
    address = models.CharField(db_index=True, help_text="Địa chỉ", max_length=255)
    latitude = models.FloatField(help_text="Vĩ độ")
    longitude = models.FloatField(help_text="Kinh độ")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='houses', help_text="Chủ nhà")
    type = models.CharField(
        max_length=20, 
        choices=[(house_type.value[0], house_type.name) for house_type in HouseType],
        db_index=True,
        help_text="Loại nhà"
    )
    base_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True, help_text="Giá cơ bản")
    water_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0, help_text="Giá nước")
    electricity_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0, help_text="Giá điện")
    internet_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0, help_text="Giá internet")
    trash_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0, help_text="Giá rác")
    is_verified = models.BooleanField(default=False, db_index=True, help_text="Đã xác thực")
    media_files = GenericRelation(Media)
    area = models.FloatField(null=True, blank=True, help_text="Diện tích (m2)")
    deposit = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True, help_text="Tiền cọc")
    max_rooms = models.IntegerField(null=True, blank=True, help_text="Số phòng tối đa")
    current_rooms = models.IntegerField(null=True, blank=True, default=0, help_text="Số phòng đã cho thuê")
    max_people = models.IntegerField(null=True, blank=True, help_text="Số người tối đa")
    is_renting = models.BooleanField(default=True, db_index=True, help_text="Đang cho thuê")
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['address']),
            models.Index(fields=['type']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['is_renting']),
        ]
    def __str__(self):
        return self.title or f"House {self.id}"

    def get_avg_rating(self):
        cache_key = f'house_rating_{self.id}'
        avg_rating = cache.get(cache_key)
        if avg_rating is None:
            avg_rating = self.ratings.aggregate(avg=Avg('star'))['avg'] or 0
            cache.set(cache_key, avg_rating, 3600)  # Cache for 1 hour
        return avg_rating

    def get_thumbnail(self):
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None

    def is_room_type(self):
        return self.type == HouseType.ROOM.value[0] or self.type == HouseType.DORMITORY.value[0]
    
    def get_type_display(self):
        return self.type

    def get_base_price_display(self):
        if self.base_price is not None:
            return f"{self.base_price:,.0f} VND"
        return "0 VND"
   
class Rate(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, help_text="Người đánh giá")
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='ratings', help_text="Nhà được đánh giá")
    star = models.IntegerField(choices=[(i, i) for i in range(1, 6)], help_text="Số sao")
    comment = models.TextField(null=True, blank=True, help_text="Bình luận")
    media_files = GenericRelation(Media)
    class Meta:
        unique_together = ('user', 'house')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['star']),
            models.Index(fields=['house']),
        ]
    def __str__(self):
        return f"{self.user.username} rated House {self.house.id} with {self.star} stars"

class Post(BaseModel):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts', help_text="Tác giả")
    type = models.CharField(
        max_length=20, 
        choices=[(post_type.value[0], post_type.name) for post_type in PostType],
        db_index=True,
        help_text="Loại bài viết"
    )
    title = models.CharField(max_length=100, null=True, blank=True, db_index=True, help_text="Tiêu đề")
    content = models.TextField(help_text="Nội dung")
    address = models.CharField(null=True, blank=True, db_index=True, help_text="Địa chỉ", max_length=255)
    latitude = models.FloatField(null=True, blank=True, help_text="Vĩ độ")
    longitude = models.FloatField(null=True, blank=True, help_text="Kinh độ")
    house_link = models.ForeignKey(House, on_delete=models.CASCADE, null=True, blank=True, related_name='posts', help_text="Nhà liên kết")
    is_active = models.BooleanField(default=True, db_index=True, help_text="Đang hoạt động")
    media_files = GenericRelation(Media)
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['type']),
            models.Index(fields=['address']),
            models.Index(fields=['is_active']),
        ]
    def __str__(self):
        return f"{self.type} by {self.author.username}"
    
    def get_interaction_count(self, interaction_type=None):
        if interaction_type:
            return self.interaction_set.filter(type=interaction_type).count()
        return self.interaction_set.filter(type=InteractionType.LIKE.value[0]).count()
    
    def get_comment_count(self):
        return self.comments.count()
    
    def get_thumbnail(self):
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None
    
class Comment(BaseModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', help_text="Bài viết")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments', help_text="Tác giả")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', help_text="Bình luận cha")
    content = models.TextField(help_text="Nội dung")
    media_files = GenericRelation(Media)
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['author']),
        ]
    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"
    
    def get_reply_count(self):
        return self.replies.count()
        
class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, help_text="Người tương tác")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, help_text="Bài viết")
    type = models.CharField(
        max_length=20,
        choices=[(interaction_type.value[0], interaction_type.name) for interaction_type in InteractionType],
        db_index=True,
        help_text="Loại tương tác"
    )
    class Meta:
        unique_together = ('user', 'post')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['user']),
            models.Index(fields=['post']),
        ]
    def __str__(self):
        return f"{self.user.username} {self.type} Post {self.post.id}"

class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', help_text="Người nhận")
    content = models.TextField(help_text="Nội dung")
    url = models.URLField(null=True, blank=True, help_text="Đường dẫn liên quan")
    type = models.CharField(
        max_length=20,
        choices=[(notification_type.value[0], notification_type.name) for notification_type in NotificationType],
        db_index=True,
        help_text="Loại thông báo"
    )
    is_read = models.BooleanField(default=False, db_index=True, help_text="Đã đọc")
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications', help_text="Người gửi")
    related_object_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('related_object_type', 'related_object_id')
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['type']),
            models.Index(fields=['is_read']),
        ]
    def __str__(self):
        return f"Notification for {self.user.username}: {self.type}"

class ChatGroup(BaseModel):
    name = models.CharField(max_length=100, null=True, blank=True, db_index=True, help_text="Tên nhóm")
    description = models.TextField(null=True, blank=True, help_text="Mô tả")
    is_group = models.BooleanField(default=False, db_index=True, help_text="Là nhóm chat")
    members = models.ManyToManyField(User, related_name='chat_groups', through='ChatMembership')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_chats', help_text="Người tạo")
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_group']),
        ]
    def __str__(self):
        if self.is_group:
            return f"Group: {self.name or f'Chat group {self.id}'}"
        else:
            members = self.members.all()
            if members.count() >= 2:
                return f"Chat between {members[0].username} and {members[1].username}"
            return f"Chat {self.id}"
    
    @classmethod
    def get_or_create_direct_chat(cls, user1, user2):
        existing_chat = cls.objects.filter(
            is_group=False,
            members=user1
        ).filter(
            members=user2
        ).first()
        
        if existing_chat:
            return existing_chat
            
        chat = cls.objects.create(
            is_group=False,
            created_by=user1
        )
        
        ChatMembership.objects.create(
            chat_group=chat,
            user=user1,
            is_admin=True
        )
        
        ChatMembership.objects.create(
            chat_group=chat,
            user=user2,
            is_admin=False
        )
        
        return chat
        
    def add_member(self, user, is_admin=False):
        if not self.members.filter(id=user.id).exists():
            ChatMembership.objects.create(
                chat_group=self,
                user=user,
                is_admin=is_admin
            )
            return True
        return False
        
    def remove_member(self, user):
        membership = self.chat_memberships.filter(user=user).first()
        if membership:
            membership.delete()
            return True
        return False

class ChatMembership(BaseModel):
    chat_group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='chat_memberships', help_text="Nhóm chat")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships', help_text="Thành viên")
    is_admin = models.BooleanField(default=False, help_text="Là quản trị viên")
    nickname = models.CharField(max_length=100, null=True, blank=True, help_text="Biệt danh")
    last_read_at = models.DateTimeField(null=True, blank=True, help_text="Thời gian đọc cuối")
    class Meta:
        unique_together = ('chat_group', 'user')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['chat_group']),
            models.Index(fields=['user']),
        ]
    def __str__(self):
        return f"{self.user.username} in {self.chat_group}"
    
    def mark_as_read(self):
        self.last_read_at = timezone.now()
        self.save(update_fields=['last_read_at'])
        
    def get_unread_count(self):
        if not self.last_read_at:
            return self.chat_group.messages.count()
        return self.chat_group.messages.filter(created_at__gt=self.last_read_at).count()
    
    def has_any_message(self):
        return self.chat_group.messages.exists()

    
class Message(BaseModel):
    chat_group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages', help_text="Nhóm chat")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', help_text="Người gửi")
    content = models.TextField(null=True, blank=True, help_text="Nội dung")
    is_system_message = models.BooleanField(default=False, help_text="Tin nhắn hệ thống")
    is_removed = models.BooleanField(default=False, help_text="Đã bị xoá")
    replied_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies', help_text="Tin nhắn trả lời")
    media_files = GenericRelation(Media)
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['chat_group']),
            models.Index(fields=['sender']),
        ]
    def __str__(self):
        return f"Message from {self.sender.username} in {self.chat_group}"
    
    def get_formatted_content(self):
        if self.is_removed:
            return "Tin nhắn đã bị xóa"
        return self.content
    
    def soft_delete(self):
        self.is_removed = True
        self.content = ""
        self.save(update_fields=['is_removed', 'content'])

class VerificationCode(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes', null=True, blank=True, help_text="Người dùng")
    email = models.EmailField(null=True, blank=True, help_text="Email")
    code = models.CharField(max_length=10, help_text="Mã xác thực")
    is_used = models.BooleanField(default=False, db_index=True, help_text="Đã sử dụng")
    expires_at = models.DateTimeField(help_text="Hết hạn")
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['email']),
            models.Index(fields=['is_used']),
        ]
    def __str__(self):
        if self.user:
            return f"Verification code for {self.user.username}"
        return f"Verification code for {self.email}"
    
    @classmethod
    def generate_code(cls, user):
        code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRY_MINUTES)
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        verification_code = cls.objects.create(
            user=user,
            email=user.email,
            code=code,
            expires_at=expires_at
        )
        
        return verification_code
    
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()
    
    def mark_as_used(self):
        self.is_used = True
        self.save(update_fields=['is_used'])

class PasswordResetToken(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens', help_text="Người dùng")
    token = models.CharField(max_length=100, unique=True, help_text="Token")
    is_used = models.BooleanField(default=False, db_index=True, help_text="Đã sử dụng")
    expires_at = models.DateTimeField(help_text="Hết hạn")
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_used']),
        ]
    def __str__(self):
        return f"Password reset token for {self.user.username}"

class Report(BaseModel):
    reporter = models.ForeignKey('User', on_delete=models.CASCADE, related_name='reports_made', help_text="Người báo cáo")
    reported_user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='reports_received', help_text="Người bị báo cáo")
    type = models.CharField(
        max_length=20,
        choices=[(t.value[0], t.value[1]) for t in ReportType],
        db_index=True,
        help_text="Loại báo cáo"
    )
    reason = models.TextField(help_text="Lý do")
    url_tag = models.TextField(null=True, blank=True, help_text="URL liên quan")
    is_resolved = models.BooleanField(default=False, db_index=True, help_text="Đã giải quyết")
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reporter']),
            models.Index(fields=['reported_user']),
            models.Index(fields=['type']),
            models.Index(fields=['is_resolved']),
        ]
    def __str__(self):
        return f"{self.reporter.username} tố cáo {self.reported_user.username}: {self.get_type_display()}"