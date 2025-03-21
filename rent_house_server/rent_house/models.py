from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN = 'ADMIN', 'Quản trị viên'
    HOST = 'HOST', 'Chủ trọ'
    RENTER = 'RENTER', 'Người thuê'
    MODERATOR = 'MODERATOR', 'Người kiểm duyệt'

class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.RENTER)
    address = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    room = models.ForeignKey('Room', on_delete=models.SET_NULL, null=True, blank=True, related_name='renters')

    def __str__(self):
        return self.username
    
class HouseType(models.TextChoices):
    APARTMENT = 'APARTMENT', 'Căn hộ'
    DORMITORY = 'DORMITORY', 'Ký túc xá'
    SHARED_ROOM = 'SHARED_ROOM', 'Phòng ở ghép'

class House(models.Model):
    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='houses')
    type = models.CharField(max_length=20, choices=HouseType.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.title or f"House {self.id}"
    
class Room(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='rooms')
    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_people = models.IntegerField()
    cur_people = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or f"Room {self.id} in House {self.house.id}"

class PostType(models.TextChoices):
    RENTAL_LISTING = 'RENTAL_LISTING', 'Tin cho thuê'
    SEARCH_LISTING = 'SEARCH_LISTING', 'Tin tìm kiếm'

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    type = models.CharField(max_length=20, choices=PostType.choices)
    content = models.TextField()
    address = models.TextField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.type} by {self.author.username}"
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"
    
class InteractionType(models.TextChoices):
    LIKE = 'LIKE', 'Thích'
    SAVE = 'SAVE', 'Lưu'

class Interaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=InteractionType.choices)

    class Meta:
        unique_together = ('user', 'post', 'type')

    def __str__(self):
        return f"{self.user.username} {self.type} Post {self.post.id}"
    
class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followee')

    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"
    
class NotificationType(models.TextChoices):
    NEW_POST = 'NEW_POST', 'Bài đăng mới'
    COMMENT = 'COMMENT', 'Bình luận'
    FOLLOW = 'FOLLOW', 'Theo dõi'

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    url = models.URLField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.type}"
    
class BoxChat(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boxchats1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boxchats2')
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"
    
class Message(models.Model):
    boxchat = models.ForeignKey(BoxChat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)

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