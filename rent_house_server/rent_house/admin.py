from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, AdminPasswordChangeForm
from django.utils.safestring import mark_safe
from rent_house.models import Media, House, Room, Post, Comment, User
from django.contrib.contenttypes.models import ContentType
from rent_house.utils import upload_image_to_cloudinary

# Custom form for avatar uploads
class CustomUserChangeForm(UserChangeForm):
    avatar_upload = forms.ImageField(required=False, help_text="Upload a new profile image")
    
    class Meta:
        model = User
        fields = '__all__'
    
    def save(self, commit=True):
        user = super().save(commit=False)
        
        # Handle avatar upload if provided
        avatar_file = self.cleaned_data.get('avatar_upload')
        if avatar_file:
            # Upload to Cloudinary
            image_url = upload_image_to_cloudinary(avatar_file, folder="user_avatars")
            if image_url:
                # Update user avatar
                user.avatar = image_url
                
                # Create or update Media object
                content_type = ContentType.objects.get_for_model(User)
                media, created = Media.objects.get_or_create(
                    content_type=content_type,
                    object_id=user.id,
                    purpose='avatar',
                    defaults={
                        'url': image_url,
                        'media_type': 'image',
                        'public_id': image_url.split('/')[-1].split('.')[0]
                    }
                )
                
                if not created:
                    # Update existing avatar
                    media.url = image_url
                    media.public_id = image_url.split('/')[-1].split('.')[0]
                    media.save()
                    
                # Generate thumbnail versions
                media.generate_all_sizes()
        
        if commit:
            user.save()
        return user

class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm
    change_password_form = AdminPasswordChangeForm
    
    def avatar_display(self, obj):
        if obj.avatar:
            return mark_safe(f'<img src="{obj.avatar}" width="100" height="100" style="object-fit: cover; border-radius: 50%;" />')
        return mark_safe('<span>No Avatar</span>')
    
    avatar_display.short_description = 'Current Avatar'
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'address')}),
        ('Avatar', {'fields': ('avatar_display', 'avatar', 'avatar_upload')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    readonly_fields = ('last_login', 'date_joined', 'avatar_display')
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'avatar_thumbnail')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role')
    
    def avatar_thumbnail(self, obj):
        if obj.avatar:
            return mark_safe(f'<img src="{obj.avatar}" width="50" height="50" style="object-fit: cover; border-radius: 50%;" />')
        return ""
    
    avatar_thumbnail.short_description = 'Avatar'
    
    def get_readonly_fields(self, request, obj=None):
        # Make avatar field read-only (it's updated through avatar_upload)
        readonly_fields = list(super().get_readonly_fields(request, obj))
        if 'avatar' not in readonly_fields:
            readonly_fields.append('avatar')
        return readonly_fields

# Register your models here.
admin.site.register(Media)
admin.site.register(House)
admin.site.register(Room)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(User, CustomUserAdmin)
