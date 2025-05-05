from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q, Count, Avg
from enum import Enum
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
import json

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
    MESSAGE = 'message', 'Tin nhắn'

class InteractionType(Enum):
    LIKE = 'like', 'Thích'
    DISLIKE = 'dislike', 'Không thích'

    def __str__(self):
        return self.value[1]
    
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True



class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=[(role.value[0], role.name) for role in Role], default=Role.RENTER.value[0])
    address = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)

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
    
    def get_avatar_url(self, size='medium'):
        """Lấy URL avatar với kích thước tùy chỉnh"""
        avatar_media = self.media_files.filter(purpose='avatar').first()
        if avatar_media:
            return avatar_media.get_url(size)
        return self.avatar  # Fallback to legacy avatar
    
    def get_rented_rooms(self):
        """Lấy tất cả phòng mà người dùng đang thuê"""
        return Room.objects.filter(rentals__user=self, rentals__is_active=True)
        
    def get_owned_houses(self):
        """Lấy tất cả nhà mà người dùng sở hữu"""
        return self.houses.all()

class MediaManager(models.Manager):
    def get_for_object(self, obj):
        """Get all media for a specific object"""
        content_type = ContentType.objects.get_for_model(obj)
        return self.filter(content_type=content_type, object_id=obj.id)
    
    def get_images(self):
        """Get only images"""
        return self.filter(media_type='image')
    
    def get_videos(self):
        """Get only videos"""
        return self.filter(media_type='video')
    
    def get_by_purpose(self, purpose):
        """Get media by purpose"""
        return self.filter(purpose=purpose)

class Media(BaseModel):
    MEDIA_TYPES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    
    PURPOSE_CHOICES = (
        ('avatar', 'User Avatar'),
        ('cover', 'Cover Photo'),
        ('gallery', 'Gallery Image'),
        ('attachment', 'Attachment')
    )
    
    url = models.URLField()
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    public_id = models.CharField(max_length=255, blank=True, null=True)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, null=True, blank=True)
    
    # Generic relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Cache URLs for common sizes
    thumbnail_url = models.URLField(blank=True, null=True)
    medium_url = models.URLField(blank=True, null=True)
    
    objects = MediaManager()
    
    def __str__(self):
        return f"{self.get_media_type_display()} for {self.content_object}"
    
    def get_url(self, size=None):
        """
        Get URL with custom size
        :param size: Desired size ('thumbnail', 'medium', 'large', or tuple (width, height))
        :return: URL of the media file
        """
        # If not image or no resize needed, return original URL
        if self.media_type != 'image' or not size:
            return self.url
            
        # Check for cached URLs
        if size == 'thumbnail' and self.thumbnail_url:
            return self.thumbnail_url
        if size == 'medium' and self.medium_url:
            return self.medium_url
            
        # Handle Cloudinary URLs
        if '/' not in self.url:
            return self.url
            
        # Split Cloudinary URL
        base_url = self.url.split('/upload/')[0] + '/upload/'
        image_part = self.url.split('/upload/')[1] if len(self.url.split('/upload/')) > 1 else ''
        
        if not image_part:
            return self.url
            
        # Define transformation
        transform = ''
        if size == 'thumbnail':
            transform = 'w_150,h_150,c_fill/'
        elif size == 'medium':
            transform = 'w_500,c_scale/'
        elif size == 'large':
            transform = 'w_1200,c_scale/'
        elif isinstance(size, tuple) and len(size) == 2:
            transform = f'w_{size[0]},h_{size[1]},c_fill/'
            
        # Create URL with transformation
        new_url = f"{base_url}{transform}{image_part}"
        
        # Cache URLs for common sizes
        if size == 'thumbnail' and not self.thumbnail_url:
            self.thumbnail_url = new_url
            self.save(update_fields=['thumbnail_url'])
        elif size == 'medium' and not self.medium_url:
            self.medium_url = new_url
            self.save(update_fields=['medium_url'])
            
        return new_url

    def generate_all_sizes(self):
        """Generate all common sizes and cache them"""
        if self.media_type == 'image':
            self.get_url('thumbnail')
            self.get_url('medium')
            self.get_url('large')

class House(BaseModel):
    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='houses')
    type = models.CharField(max_length=20, choices=[(house_type.value[0], house_type.name) for house_type in HouseType])
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
        """Lấy điểm đánh giá trung bình"""
        # Sử dụng cache để tối ưu hiệu suất
        cache_key = f'house_rating_{self.id}'
        avg_rating = cache.get(cache_key)
        if avg_rating is None:
            avg_rating = self.ratings.aggregate(avg=Avg('star'))['avg'] or 0
            cache.set(cache_key, avg_rating, 3600)  # Cache trong 1 giờ
        return avg_rating
    
    def get_room_count(self):
        """Lấy số lượng phòng"""
        return self.rooms.count()
    
    def get_available_rooms(self):
        """Lấy các phòng còn trống"""
        return self.rooms.filter(cur_people__lt=models.F('max_people'))
    
    def get_thumbnail(self):
        """Lấy ảnh thumbnail đầu tiên của nhà"""
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None
    
class Room(BaseModel):
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
        """Kiểm tra phòng còn chỗ không"""
        return self.cur_people < self.max_people
    
    def get_renters(self):
        """Lấy danh sách người thuê phòng"""
        return User.objects.filter(rentals__room=self, rentals__is_active=True)
    
    def get_thumbnail(self):
        """Lấy ảnh thumbnail đầu tiên của phòng"""
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None

# Mô hình mới: RoomRental - Quản lý quan hệ thuê phòng
class RoomRental(BaseModel):
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

class Post(BaseModel):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    type = models.CharField(max_length=20, choices=[(post_type.value[0], post_type.name) for post_type in PostType])
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
        """Lấy số lượng tương tác (like, dislike)"""
        if interaction_type:
            return self.interaction_set.filter(type=interaction_type, is_interacted=True).count()
        return self.interaction_set.filter(is_interacted=True).count()
    
    def get_comment_count(self):
        """Lấy số lượng bình luận"""
        return self.comments.count()
    
    def get_thumbnail(self):
        """Lấy ảnh thumbnail đầu tiên của bài viết"""
        first_image = self.media_files.filter(media_type='image').first()
        if first_image:
            return first_image.get_url('thumbnail')
        return None
    
class Comment(BaseModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    media_files = GenericRelation(Media)

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"
    
    def get_reply_count(self):
        """Lấy số lượng phản hồi"""
        return self.replies.count()
        
class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=[(interaction_type.value[0], interaction_type.name) for interaction_type in InteractionType])
    is_interacted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'post', 'type')

    def __str__(self):
        return f"{self.user.username} {self.type} Post {self.post.id}"
    
class Follow(BaseModel):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    is_following = models.BooleanField(default=True)

    class Meta:
        unique_together = ('follower', 'followee')

    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"
    
class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    url = models.URLField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=[(notification_type.value[0], notification_type.name) for notification_type in NotificationType])
    is_read = models.BooleanField(default=False)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    related_object_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('related_object_type', 'related_object_id')

    def __str__(self):
        return f"Notification for {self.user.username}: {self.type}"

# Mô hình mới: ChatGroup - Hỗ trợ chat nhóm    
class ChatGroup(BaseModel):
    name = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_group = models.BooleanField(default=False)  # False = chat 1-1, True = chat nhóm
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
        """Lấy hoặc tạo mới chat 1-1 giữa hai người dùng"""
        # Tìm chat hiện có
        existing_chat = cls.objects.filter(
            is_group=False,
            members=user1
        ).filter(
            members=user2
        ).first()
        
        if existing_chat:
            return existing_chat
            
        # Tạo chat mới
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
        """Thêm thành viên vào nhóm chat"""
        if not self.members.filter(id=user.id).exists():
            ChatMembership.objects.create(
                chat_group=self,
                user=user,
                is_admin=is_admin
            )
            return True
        return False
        
    def remove_member(self, user):
        """Xóa thành viên khỏi nhóm chat"""
        membership = self.chat_memberships.filter(user=user).first()
        if membership:
            membership.delete()
            return True
        return False

# Mô hình trung gian cho ManyToMany giữa ChatGroup và User
class ChatMembership(BaseModel):
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
        """Đánh dấu đã đọc đến thời điểm hiện tại"""
        from django.utils import timezone
        self.last_read_at = timezone.now()
        self.save(update_fields=['last_read_at'])
        
    def get_unread_count(self):
        """Lấy số tin nhắn chưa đọc"""
        if not self.last_read_at:
            return self.chat_group.messages.count()
        return self.chat_group.messages.filter(created_at__gt=self.last_read_at).count()
    
class Message(BaseModel):
    chat_group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_system_message = models.BooleanField(default=False)  # Tin nhắn hệ thống (thông báo)
    is_removed = models.BooleanField(default=False)  # Đánh dấu đã xóa thay vì xóa hoàn toàn
    replied_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    media_files = GenericRelation(Media)
    
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.username} in {self.chat_group}"
    
    def get_formatted_content(self):
        """Định dạng nội dung tin nhắn"""
        if self.is_removed:
            return "Tin nhắn đã bị xóa"
        return self.content
    
    def soft_delete(self):
        """Xóa mềm tin nhắn"""
        self.is_removed = True
        self.content = ""
        self.save(update_fields=['is_removed', 'content'])
        
class Rate(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='ratings')
    star = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(null=True, blank=True)
    media_files = GenericRelation(Media)

    class Meta:
        unique_together = ('user', 'house')

    def __str__(self):
        return f"{self.user.username} rated House {self.house.id} with {self.star} stars"