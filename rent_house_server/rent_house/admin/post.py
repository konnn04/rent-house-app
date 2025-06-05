from django.contrib import admin
from django.utils.html import format_html
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse
from django.template.loader import render_to_string

from unfold.admin import ModelAdmin
from unfold.decorators import action
from unfold.paginator import InfinitePaginator

from ..models import Post


@admin.register(Post)
class PostAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 20  
    list_display = ('id', 'display_thumbnail', 'title_or_content_preview', 'author', 'type', 'is_active', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    list_filter = ('type', 'is_active', 'created_at')
    readonly_fields = ('display_thumbnail', 'display_images', 'interaction_info', 'created_at', 'updated_at', 'author', 'info_house')
    ordering = ('-created_at',)
    list_filter_sheet = False

    actions_row = ["toggle_active_status"]
    
    @action(description="Toggle Active Status")
    def toggle_active_status(self, request, object_id):
        post = Post.objects.get(id=object_id)
        post.is_active = not post.is_active
        post.save()
        status = "activated" if post.is_active else "deactivated"
        messages.success(request, f"Post has been {status}.")
        return HttpResponseRedirect(reverse('admin:rent_house_post_changelist'))
    
    def display_thumbnail(self, obj):
        thumbnail = obj.get_thumbnail()
        if thumbnail:
            return format_html('<img src="{}" width="100" />', thumbnail)
        return "No Image"
    display_thumbnail.short_description = 'Thumbnail'
    
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
    
    def title_or_content_preview(self, obj):
        if obj.title:
            return obj.title
        if obj.content:
            return f"{obj.content[:50]}..." if len(obj.content) > 50 else obj.content
        return "No content"
    title_or_content_preview.short_description = 'Title/Content'
    
    def interaction_info(self, obj):
        interaction_count = obj.get_interaction_count(interaction_type='like')
        comment_count = obj.get_comment_count()
        return format_html(
            '<strong>Likes:</strong> {}<br><strong>Comments:</strong> {}',
            interaction_count, comment_count
        )
    interaction_info.short_description = 'Interactions'

    def info_house(self, obj):
        if obj.house_link:
            context = {
                "house": obj.house_link,
                "thumbnail": obj.house_link.get_thumbnail or "",
            }
            return render_to_string("admin/widgets/house_link_info.html", context)
        return "-"
    
    fieldsets = (
        (None, {
            'fields': ('author', 'type', 'title', 'content', 'is_active', 'interaction_info')
        }),
        ('Attachments', {
            'fields': ('info_house','display_images','house_link')
        }),
        ('Location', {
            'fields': ('address', 'latitude', 'longitude')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
