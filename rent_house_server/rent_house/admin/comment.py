from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import action
from unfold.paginator import InfinitePaginator

from ..models import Comment, Post

@admin.register(Comment)
class CommentAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'post_link', 'author', 'short_content', 'created_at')
    search_fields = ('content', 'author__username', 'post__title')
    list_filter = ('created_at', 'author')
    readonly_fields = ('display_images', 'created_at', 'updated_at', 'post', 'author', 'parent')
    ordering = ('-created_at',)
    actions_row = ["soft_delete_comment"]
    list_fullwidth = True
    list_filter_sheet = False

    def post_link(self, obj):
        if obj.post:
            return format_html('<a href="/admin/rent_house/post/{}/change/">{}</a>', obj.post.id, obj.post.title or obj.post.id)
        return "-"
    post_link.short_description = "Post"

    def short_content(self, obj):
        return (obj.content[:50] + "...") if obj.content and len(obj.content) > 50 else obj.content
    short_content.short_description = "Content"

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

    @action(description="Xóa mềm bình luận")
    def soft_delete_comment(self, request, object_id):
        comment = Comment.objects.get(id=object_id)
        comment.is_removed = True
        comment.content = ""
        comment.save()
        self.message_user(request, "Đã xóa mềm bình luận.")
