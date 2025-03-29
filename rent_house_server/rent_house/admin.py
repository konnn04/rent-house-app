from django.contrib import admin
from rent_house.models import Image, House, Room, Post, Comment, User

# Register your models here.
admin.site.register(Image)
admin.site.register(House)
admin.site.register(Room)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(User)