from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from ..models import Media

@admin.register(Media)
class MediaAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'media_type', 'purpose', 'preview', 'content_object', 'created_at')
    search_fields = ('url', 'purpose')
    list_filter = ('media_type', 'purpose', 'created_at')
    readonly_fields = ('preview', 'created_at', 'updated_at', 'content_type', 'object_id')
    ordering = ('-created_at',)
    list_fullwidth = True
    list_filter_sheet = False

    def preview(self, obj):
        if obj.media_type == 'image':
            return format_html('<img src="{}" width="100" />', obj.get_url('thumbnail'))
        elif obj.media_type == 'video':
            return format_html('<video src="{}" width="150" controls></video>', obj.url)
        return "-"
    preview.short_description = "Preview"
