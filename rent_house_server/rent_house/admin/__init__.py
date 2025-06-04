from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group

from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.admin import ModelAdmin
from ..models import User, House, Post, Media, Message, Rate, Report, Comment, ChatGroup, ChatMembership

admin.site.unregister(Group)

@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

@admin.register(House)
class HouseAdmin(ModelAdmin):
    list_display = ('id', 'title', 'owner', 'created_at')
    search_fields = ('title', 'owner__username')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

@admin.register(Post)
class PostAdmin(ModelAdmin):
    list_display = ('id', 'house_link', 'author', 'created_at')
    search_fields = ('house__title', 'author__username')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

@admin.register(ChatGroup)
class ChatGroupAdmin(ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)
    ordering = ('-created_at',)
