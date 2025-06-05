from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from ..models import Rate

@admin.register(Rate)
class RateAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'house_link', 'user', 'star', 'short_comment', 'created_at')
    search_fields = ('user__username', 'house__title', 'comment')
    list_filter = ('star', 'created_at', 'house')
    readonly_fields = ('display_images', 'created_at', 'updated_at', 'user', 'house')
    ordering = ('-created_at',)
    list_fullwidth = True
    list_filter_sheet = False

    def house_link(self, obj):
        if obj.house:
            return format_html('<a href="/admin/rent_house/house/{}/change/">{}</a>', obj.house.id, obj.house.title or obj.house.id)
        return "-"
    house_link.short_description = "House"

    def short_comment(self, obj):
        return (obj.comment[:50] + "...") if obj.comment and len(obj.comment) > 50 else obj.comment
    short_comment.short_description = "Comment"

    def display_images(self, obj):
        images = obj.media_files.filter(media_type='image')
        if images:
            html = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">'
            for img in images:
                html += f'<img src="{img.url}" width="200" style="margin-bottom: 10px;" />'
            html += '</div>'
            return format_html(html)
        return "No Images"
    display_images.short_description = 'Images'
