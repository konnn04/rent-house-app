from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from ..models import Follow

@admin.register(Follow)
class FollowAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'follower', 'followee', 'is_following', 'created_at')
    search_fields = ('follower__username', 'followee__username')
    list_filter = ('is_following', 'created_at')
    readonly_fields = ('follower', 'followee', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True
