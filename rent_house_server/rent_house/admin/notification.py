from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from ..models import Notification

@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'user', 'type', 'content', 'is_read', 'created_at')
    search_fields = ('user__username', 'content')
    list_filter = ('type', 'is_read', 'created_at')
    readonly_fields = ('user', 'content', 'type', 'url', 'is_read', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    list_fullwidth = True
    list_filter_sheet = False
