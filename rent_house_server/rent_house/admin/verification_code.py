from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from ..models import VerificationCode

@admin.register(VerificationCode)
class VerificationCodeAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 30
    list_display = ('id', 'user', 'email', 'code', 'is_used', 'expires_at', 'created_at')
    search_fields = ('user__username', 'email', 'code')
    list_filter = ('is_used', 'expires_at', 'created_at')
    readonly_fields = ('user', 'email', 'code', 'is_used', 'expires_at', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True
