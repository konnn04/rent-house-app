from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse
from unfold.widgets import UnfoldAdminFileFieldWidget
from unfold.admin import ModelAdmin
from unfold.decorators import action, display
from unfold.forms import UserChangeForm
from unfold.paginator import InfinitePaginator

from django import forms

from ..models import User
from ..utils import upload_image_to_cloudinary

class UserChangeCustomForm(UserChangeForm):
    avatar_upload = forms.ImageField(label="Upload avatar mới", required=False, widget=UnfoldAdminFileFieldWidget())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.avatar:
            self.fields['avatar_upload'].help_text = format_html(
                '<div>Avatar hiện tại:</div><img src="{}" width="150" height="150" style=" object-fit: cover; border: 1px solid #ccc; margin-bottom:8px;" />',
                self.instance.avatar
            )
        else:
            self.fields['avatar_upload'].help_text = "Chưa có avatar"

    def save(self, commit=True):
        user = super().save(commit=False)
        avatar_file = self.cleaned_data.get('avatar_upload')
        if avatar_file:
            avatar_url = upload_image_to_cloudinary(avatar_file, folder="user_avatars")
            if avatar_url:
                user.avatar = avatar_url
        if commit:
            user.save()
        return user


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 20  
    list_display = ('id', 'display_avatar', 'get_full_name', 'username', 'email', 'phone_number', 'role', 'is_active', 'is_staff', 'is_identity_verified')
    search_fields = ('username', 'email', 'phone_number', 'first_name', 'last_name')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'role', 'date_joined')
    readonly_fields = ('last_login', 'date_joined', 'display_avatar', 'is_identity_verified')
    ordering = ('-date_joined',)
    list_filter_sheet = False
    actions_row = ["toggle_active_status", "promote_to_owner"]

    actions_detail = ["verify_identity"]
    
    @action(description="Kích hoạt/Dừng kích hoạt người dùng")
    def toggle_active_status(self, request, object_id):
        user = User.objects.get(id=object_id)
        user.is_active = not user.is_active
        user.save()
        status = "activated" if user.is_active else "deactivated"
        messages.success(request, f"User {user.username} has been {status}.")
        return HttpResponseRedirect(reverse('admin:rent_house_user_changelist'))
    
    @action(description="Chuyển vai trò thành Owner")
    def promote_to_owner(self, request, object_id):
        from ..models import Role
        user = User.objects.get(id=object_id)
        user.role = Role.OWNER.value[0]
        user.save()
        messages.success(request, f"User {user.username} has been promoted to Owner role.")
        return HttpResponseRedirect(reverse('admin:rent_house_user_changelist'))
    
    @action(description="Xác minh danh tính")
    def verify_identity(self, request, object_id):
        from ..models import IdentityVerification
        user = User.objects.get(id=object_id)
        verification_request = IdentityVerification.objects.filter(user=user, is_verified=False).first()
        if verification_request:
            return HttpResponseRedirect(reverse('admin:rent_house_identityverification_change', args=[verification_request.id]))
        else:
            messages.error(request, f"Không tìm thấy yêu cầu xác minh danh tính cho người dùng {user.username}.")
        return HttpResponseRedirect(reverse('admin:rent_house_user_changelist'))
    @display(description="Verified")
    def is_verified(self, obj):
        is_verified = obj.is_identity_verified() if hasattr(obj, 'is_identity_verified') else False
        if is_verified:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    
    form = UserChangeCustomForm
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': ('avatar_upload', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'address')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    def display_avatar(self, obj):
        avatar = obj.avatar if obj.avatar else "https://www.svgrepo.com/show/452030/avatar-default.svg"
        return format_html('''
            <img src="{}" width="50" height="50" style="border-radius: 50%; object-fit: cover;" />
        ''', avatar)
    
    display_avatar.short_description = 'Avatar'
