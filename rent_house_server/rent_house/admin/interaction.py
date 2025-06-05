from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from ..models import Interaction

@admin.register(Interaction)
class InteractionAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'user', 'post', 'type', 'created_at')
    search_fields = ('user__username', 'post__title')
    list_filter = ('type', 'created_at')
    readonly_fields = ('user', 'post', 'type', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True
