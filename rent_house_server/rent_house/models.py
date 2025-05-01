from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from enum import Enum

class Role(Enum):
    ADMIN = 'admin', 'Quản trị viên'
    OWNER = 'owner', 'Chủ nhà'
    MODERATOR = 'moderator', 'Người quản lý'
    RENTER = 'renter', 'Người thuê trọ'

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

class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=[(role.value[0], role.name) for role in Role], default=Role.RENTER.value[0])
    address = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    room = models.ForeignKey('Room', on_delete=models.SET_NULL, null=True, blank=True, related_name='renters')

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

class House(models.Model):
    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='houses')
    type = models.CharField(max_length=20, choices=[(house_type.value[0], house_type.name) for house_type in HouseType])
    base_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    water_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    electricity_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    internet_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    trash_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, default=0)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.title or f"House {self.id}"
    
class Room(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='rooms')
    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    max_people = models.IntegerField(default=1)
    cur_people = models.IntegerField(default=0)
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    area = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or f"Room {self.id} in House {self.house.id}"

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    type = models.CharField(max_length=20, choices=[(post_type.value[0], post_type.name) for post_type in PostType])
    title = models.CharField(max_length=50, null=True, blank=True)
    content = models.TextField()
    address = models.TextField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    house_link = models.ForeignKey(House, on_delete=models.CASCADE, null=True, blank=True, related_name='posts')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.type} by {self.author.username}"
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"
    
class Interaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=[(interaction_type.value[0], interaction_type.name) for interaction_type in InteractionType])
    created_at = models.DateTimeField(auto_now_add=True)
    is_interacted = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'post', 'type')

    def __str__(self):
        return f"{self.user.username} {self.type} Post {self.post.id}"
    
class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    is_following = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('follower', 'followee')

    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"
    


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    url = models.URLField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=[(notification_type.value[0], notification_type.name) for notification_type in NotificationType])
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.type}"
    
class BoxChat(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boxchats1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boxchats2')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"
    
class Message(models.Model):
    boxchat = models.ForeignKey(BoxChat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    attachment = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} in BoxChat {self.boxchat.id}"
    
class Rate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='ratings')
    star = models.IntegerField()

    class Meta:
        unique_together = ('user', 'house')

    def __str__(self):
        return f"{self.user.username} rated House {self.house.id} with {self.star} stars"
    
class Image(models.Model):
    url = models.URLField()
    house = models.ForeignKey(House, on_delete=models.CASCADE, null=True, blank=True, related_name='images')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True, blank=True, related_name='images')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name='images')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name='images')
    message = models.ForeignKey(Message, on_delete=models.CASCADE, null=True, blank=True, related_name='images')

    def __str__(self):
        return f"Image for {self.house or self.room or self.post or self.comment or self.message}"