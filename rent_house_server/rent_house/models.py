from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q, Count, Avg, F
from enum import Enum
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from django.utils import timezone
import json
import random
import string
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

###################
# ENUM DEFINITIONS
###################

class Role(Enum):
    """User roles in the system"""
    ADMIN = 'admin', 'Quản trị viên'
    MODERATOR = 'moderator', 'Người quản lý'
    OWNER = 'owner', 'Chủ nhà'
    RENTER = 'renter', 'Người thuê trọ'
    COLLABORTOR = 'collaborator', 'Cộng tác viên'

    def __str__(self):
        return self.value[1]

class HouseType(Enum):
    """Types of housing properties"""
    HOUSE = 'house', 'Nhà riêng'
    APARTMENT = 'apartment', 'Chung cư'
    DORMITORY = 'dormitory', 'Ký túc xá'
    ROOM = 'room', 'Phòng trọ'

    def __str__(self):
        return self.value[1]
    
class PostType(Enum):
    """Types of posts in the system"""
    RENTAL_LISTING = 'rental_listing', 'Cho thuê phòng trọ'
    SEARCH_LISTING = 'search_listing', 'Tìm phòng trọ'
    ROOMMATE = 'roommate', 'Tìm bạn ở ghép'

    def __str__(self):
        return self.value[1]
    
class NotificationType(Enum):
    """Types of notifications"""
    NEW_POST = 'new_post', 'Bài viết mới'
    COMMENT = 'comment', 'Bình luận'
    FOLLOW = 'follow', 'Theo dõi'
    INTERACTION = 'interaction', 'Tương tác'
    MESSAGE = 'message', 'Tin nhắn'

class InteractionType(Enum):
    """Types of interactions with posts"""
    LIKE = 'like', 'Thích'
    DISLIKE = 'dislike', 'Không thích'

    def __str__(self):
        return self.value[1]
    
class AppointmentStatus(Enum):
    """Possible statuses for appointments"""
    PENDING = 'pending', 'Chờ xác nhận'
    CONFIRMED = 'confirmed', 'Đã xác nhận'
    COMPLETED = 'completed', 'Đã hoàn thành'
    CANCELLED = 'cancelled', 'Đã hủy'

###################
# BASE MODELS
###################
    
class BaseModel(models.Model):
    """Base model with timestamp fields for inheritance"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

###################
# MEDIA MODELS
###################

class Media(BaseModel):
    """
    Media model for storing images and videos
    Can be attached to any model via GenericForeignKey
    """
    MEDIA_TYPES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    
    PURPOSE_TYPES = (
        ('avatar', 'User Avatar'),
        ('cover', 'Cover Photo'),
        ('gallery', 'Gallery Image'),
        ('attachment', 'Attachment'),
    )
    
    url = models.URLField()
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    public_id = models.CharField(max_length=255, blank=True, null=True)
    purpose = models.CharField(max_length=20, choices=PURPOSE_TYPES, null=True, blank=True)
    
    # Thumbnail and resized versions
    thumbnail_url = models.URLField(null=True, blank=True)
    medium_url = models.URLField(null=True, blank=True)
    
    # Generic relation fields
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    def __str__(self):
        return f"{self.get_media_type_display()} for {self.content_object}"
    
    def get_url(self, size=None):
        """
        Get URL with custom size
        Args:
            size: 'thumbnail', 'medium', 'large', or tuple (width, height)
        Returns:
            Formatted URL string
        """
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
        """
        Utility method to create new media for an object
        Args:
            obj: The model instance to attach media to
            url: Media URL
            media_type: Type of media ('image' or 'video')
            public_id: Cloudinary public ID (optional)
        Returns:
            New Media instance
        """
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
        """
        Get all media for a specific object
        Args:
            obj: The model instance
            media_type: Optional filter by media type
        Returns:
            QuerySet of Media objects
        """
        content_type = ContentType.objects.get_for_model(obj)
        queryset = cls.objects.filter(content_type=content_type, object_id=obj.id)
        if media_type:
            queryset = queryset.filter(media_type=media_type)
        return queryset

###################
# USER MODELS
###################

class User(AbstractUser):
    """Extended User model with additional fields"""
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(
        max_length=20, 
        choices=[(role.value[0], role.name) for role in Role], 
        default=Role.RENTER.value[0]
    )
    address = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    media_files = GenericRelation(Media)  # Direct GenericRelation

    def __str__(self):
        return self.username
    
    def set_password(self, new_password):
        """Override to save the model after setting password"""
        super().set_password(new_password)
        self.save()

    @classmethod
    def check_login(cls, username_or_email, password):
        """
        Validate login credentials
        Args:
            username_or_email: Username or email
            password: User password
        Returns:
            User instance if valid, None otherwise
        """
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
        """
        Get avatar URL with custom size
        Args:
            size: Size specification ('thumbnail', 'medium', 'large', or tuple)
        Returns:
            Formatted URL string or None
        """
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
        """
        Set new avatar from uploaded file
        Args:
            image_file: Uploaded image file
        Returns:
            Boolean indicating success
        """
        from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image
        
        if self.avatar and 'res.cloudinary.com' in self.avatar:
            delete_cloudinary_image(self.avatar)
            
        new_avatar_url = upload_image_to_cloudinary(image_file, folder="user_avatars")
        if new_avatar_url:
            self.avatar = new_avatar_url
            self.save(update_fields=['avatar'])
            return True
        return False
    
    def get_rented_rooms(self):
        """Get all rooms currently rented by the user"""
        return Room.objects.filter(rentals__user=self, rentals__is_active=True)
        
    def get_owned_houses(self):
        """Get all houses owned by the user"""
        return self.houses.all()

class Follow(BaseModel):
    """Tracks user follow relationships"""
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    is_following = models.BooleanField(default=True)

    class Meta:
        unique_together = ('follower', 'followee')

    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"

###################
# PROPERTY MODELS
###################

class House(BaseModel):
    """Property model representing a house or apartment building"""
    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='houses')
    type = models.CharField(
        max_length=20, 
        choices=[(house_type.value[0], house_type.name) for house_type in HouseType]
    )
    base_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    water_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    electricity_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    internet_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    trash_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    is_verified = models.BooleanField(default=False)
    media_files = GenericRelation(Media)

    def __str__(self):
        return self.title or f"House {self.id}"
    
    def get_avg_rating(self):
        """Get average rating from reviews"""
        cache_key = f'house_rating_{self.id}'
        avg_rating = cache.get(cache_key)
        if avg_rating is None:
            avg_rating = self.ratings.aggregate(avg=Avg('star'))['avg'] or 0
            cache.set(cache_key, avg_rating, 3600)  # Cache for 1 hour
        return avg_rating
    
    def get_room_count(self):
        """Get total number of rooms"""
        return self.rooms.count()
    
    def get_available_rooms(self):
        """Get rooms with available space"""
        return self.rooms.filter(cur_people__lt=F('max_people'))
    
    def get_thumbnail(self):
        """Get first image thumbnail"""
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None
    
class Room(BaseModel):
    """Individual room within a house"""
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='rooms')
    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    max_people = models.IntegerField(default=1)
    cur_people = models.IntegerField(default=0)
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    area = models.FloatField(null=True, blank=True)
    media_files = GenericRelation(Media)
    
    def __str__(self):
        return self.title or f"Room {self.id} in House {self.house.id}"
    
    def is_available(self):
        """Check if room has available space"""
        return self.cur_people < self.max_people
    
    def get_renters(self):
        """Get list of current renters"""
        return User.objects.filter(rentals__room=self, rentals__is_active=True)
    
    def get_thumbnail(self):
        """Get first image thumbnail"""
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None

class RoomRental(BaseModel):
    """Tracks rental agreements between users and rooms"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rentals')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='rentals')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    price_agreed = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'room', 'start_date')
    
    def __str__(self):
        return f"{self.user.username} rents {self.room} from {self.start_date}"

class Rate(BaseModel):
    """House rating and review model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='ratings')
    star = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(null=True, blank=True)
    media_files = GenericRelation(Media)

    class Meta:
        unique_together = ('user', 'house')

    def __str__(self):
        return f"{self.user.username} rated House {self.house.id} with {self.star} stars"

###################
# POST MODELS
###################

class Post(BaseModel):
    """User post model for rental listings and other content"""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    type = models.CharField(
        max_length=20, 
        choices=[(post_type.value[0], post_type.name) for post_type in PostType]
    )
    title = models.CharField(max_length=50, null=True, blank=True)
    content = models.TextField()
    address = models.TextField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    house_link = models.ForeignKey(House, on_delete=models.CASCADE, null=True, blank=True, related_name='posts')
    is_active = models.BooleanField(default=True)
    media_files = GenericRelation(Media)

    def __str__(self):
        return f"{self.type} by {self.author.username}"
    
    def get_interaction_count(self, interaction_type=None):
        """Get count of interactions (likes, dislikes)"""
        if interaction_type:
            return self.interaction_set.filter(type=interaction_type, is_interacted=True).count()
        return self.interaction_set.filter(is_interacted=True).count()
    
    def get_comment_count(self):
        """Get total comment count"""
        return self.comments.count()
    
    def get_thumbnail(self):
        """Get first image thumbnail"""
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None
    
class Comment(BaseModel):
    """Comment on a post with optional parent for replies"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    media_files = GenericRelation(Media)

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"
    
    def get_reply_count(self):
        """Get number of replies"""
        return self.replies.count()
        
class Interaction(BaseModel):
    """User interactions with posts (likes, dislikes)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    type = models.CharField(
        max_length=20,
        choices=[(interaction_type.value[0], interaction_type.name) for interaction_type in InteractionType]
    )
    is_interacted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'post', 'type')

    def __str__(self):
        return f"{self.user.username} {self.type} Post {self.post.id}"

###################
# NOTIFICATION MODELS
###################
    
class Notification(BaseModel):
    """User notification model with generic relation to related objects"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    url = models.URLField(null=True, blank=True)
    type = models.CharField(
        max_length=20,
        choices=[(notification_type.value[0], notification_type.name) for notification_type in NotificationType]
    )
    is_read = models.BooleanField(default=False)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    related_object_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('related_object_type', 'related_object_id')

    def __str__(self):
        return f"Notification for {self.user.username}: {self.type}"

###################
# MESSAGING MODELS
###################

class ChatGroup(BaseModel):
    """Group chat model supporting both 1-1 and group conversations"""
    name = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_group = models.BooleanField(default=False)  # False = 1-1 chat, True = group chat
    members = models.ManyToManyField(User, related_name='chat_groups', through='ChatMembership')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_chats')
    
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
        """
        Get or create a direct chat between two users
        Args:
            user1: First user
            user2: Second user
        Returns:
            ChatGroup instance
        """
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
        """Add a member to the chat group"""
        if not self.members.filter(id=user.id).exists():
            ChatMembership.objects.create(
                chat_group=self,
                user=user,
                is_admin=is_admin
            )
            return True
        return False
        
    def remove_member(self, user):
        """Remove a member from the chat group"""
        membership = self.chat_memberships.filter(user=user).first()
        if membership:
            membership.delete()
            return True
        return False

class ChatMembership(BaseModel):
    """Intermediate model for ManyToMany between ChatGroup and User"""
    chat_group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='chat_memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships')
    is_admin = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, null=True, blank=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('chat_group', 'user')
    
    def __str__(self):
        return f"{self.user.username} in {self.chat_group}"
    
    def mark_as_read(self):
        """Mark messages as read up to current time"""
        self.last_read_at = timezone.now()
        self.save(update_fields=['last_read_at'])
        
    def get_unread_count(self):
        """Get number of unread messages"""
        if not self.last_read_at:
            return self.chat_group.messages.count()
        return self.chat_group.messages.filter(created_at__gt=self.last_read_at).count()
    
class Message(BaseModel):
    """Chat message model"""
    chat_group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_system_message = models.BooleanField(default=False)
    is_removed = models.BooleanField(default=False)
    replied_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    media_files = GenericRelation(Media)
    
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.username} in {self.chat_group}"
    
    def get_formatted_content(self):
        """Get formatted message content"""
        if self.is_removed:
            return "Tin nhắn đã bị xóa"
        return self.content
    
    def soft_delete(self):
        """Soft delete the message (mark as removed)"""
        self.is_removed = True
        self.content = ""
        self.save(update_fields=['is_removed', 'content'])

class VerificationCode(BaseModel):
    """Model để lưu trữ mã xác thực email của người dùng"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code = models.CharField(max_length=10)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"Verification code for {self.user.username}"
    
    @classmethod
    def generate_code(cls, user):
        """
        Tạo mã xác thực mới cho user
        """
        # Tạo mã ngẫu nhiên gồm 6 chữ số
        code = ''.join(random.choices(string.digits, k=6))
        
        # Tính thời gian hết hạn
        expires_at = timezone.now() + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRY_MINUTES)
        
        # Vô hiệu hóa các mã cũ
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Tạo mã mới
        verification_code = cls.objects.create(
            user=user,
            code=code,
            expires_at=expires_at
        )
        
        return verification_code
    
    def is_valid(self):
        """
        Kiểm tra mã xác thực còn hạn không
        """
        return not self.is_used and self.expires_at > timezone.now()
    
    def mark_as_used(self):
        """
        Đánh dấu mã xác thực đã được sử dụng
        """
        self.is_used = True
        self.save(update_fields=['is_used'])