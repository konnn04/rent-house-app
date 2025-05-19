from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, AdminPasswordChangeForm
from django.utils.safestring import mark_safe
from rent_house.models import Media, House, Room, Post, Comment, User
from django.contrib.contenttypes.models import ContentType
from rent_house.utils import upload_image_to_cloudinary
from django.contrib.admin.models import LogEntry

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

class RentHouseAdminSite(admin.AdminSite):
    site_header = 'Rent House Administration'
    site_title = 'Rent House Admin'
    index_title = 'Dashboard'
    
    def get_app_list(self, request):
        """
        Return a sorted list of all the installed apps that have been
        registered in this site.
        """
        app_list = super().get_app_list(request)
        
        # Add statistics counts to the context
        from rent_house.models import User, House, Room, Post
        for app in app_list:
            if app['app_label'] == 'rent_house':
                for model in app['models']:
                    if model['object_name'] == 'User':
                        model['count'] = User.objects.count()
                    elif model['object_name'] == 'House':
                        model['count'] = House.objects.count()
                    elif model['object_name'] == 'Room':
                        model['count'] = Room.objects.count()
                    elif model['object_name'] == 'Post':
                        model['count'] = Post.objects.count()
        
        return app_list
    
    def index(self, request, extra_context=None):
        # Add statistics to the admin index page
        from rent_house.models import User, House, Room, Post
        
        context = {
            'user_count': User.objects.count(),
            'house_count': House.objects.count(),
            'room_count': Room.objects.count(),
            'post_count': Post.objects.count(),
        }
        
        if extra_context:
            context.update(extra_context)
            
        return super().index(request, context)

# Replace the default admin site
admin_site = RentHouseAdminSite(name='rentadmin')

# Register your models with the custom admin site
admin_site.register(Media)
admin_site.register(House)
admin_site.register(Room)
admin_site.register(Post)
admin_site.register(Comment)
admin_site.register(User, CustomUserAdmin)
admin_site.register(LogEntry)  # Register LogEntry to view all actions in admin

class LogEntryAdmin(admin.ModelAdmin):
    list_display = ['action_time', 'user', 'content_type', 'object_repr', 'action_flag', 'change_message']
    list_filter = ['action_time', 'user', 'content_type', 'action_flag']
    search_fields = ['object_repr', 'change_message']
    date_hierarchy = 'action_time'
    readonly_fields = ['action_time', 'user', 'content_type', 'object_id', 'object_repr', 'action_flag', 'change_message']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False

admin.site.register(LogEntry, LogEntryAdmin)
