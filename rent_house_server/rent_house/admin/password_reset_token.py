from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from ..models import PasswordResetToken

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'user', 'token', 'is_used', 'expires_at', 'created_at')
    search_fields = ('user__username', 'token')
    list_filter = ('is_used', 'expires_at', 'created_at')
    readonly_fields = ('user', 'token', 'is_used', 'expires_at', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True
