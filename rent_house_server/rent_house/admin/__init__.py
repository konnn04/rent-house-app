from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse


from unfold.contrib.filters.admin import (
    AllValuesCheckboxFilter,
    AutocompleteSelectMultipleFilter,
    BooleanRadioFilter,
    CheckboxFilter,
    ChoicesCheckboxFilter,
    RangeDateFilter,
    RangeDateTimeFilter,
    RangeNumericFilter,
    RelatedCheckboxFilter,
    RelatedDropdownFilter,
    SingleNumericFilter,
    SliderNumericFilter,
    TextFilter,
)
from unfold.decorators import action, display
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.admin import ModelAdmin
from ..models import User, House, Post, Media, Message, Rate, Report, Comment, ChatGroup, ChatMembership, IdentityVerification

admin.site.unregister(Group)

@admin.register(IdentityVerification)
class IdentityVerificationAdmin(ModelAdmin):
    list_display = ('id', 'display_avatar', 'user', 'id_number', 'is_verified', 'created_at')
    search_fields = ('user__username', 'id_number', 'user__email', 'user__phone_number')
    list_filter = [
        ('is_verified', BooleanRadioFilter),
        ('created_at', RangeDateFilter),
    ]
    readonly_fields = ('display_avatar', 'display_id_front', 'display_id_back', 'display_selfie', 'user')
    
    ordering = ('-created_at',)
    list_filter_submit = True
    list_filter_sheet = False
    warn_unsaved_form = True
    list_disable_select_all = False
    list_fullwidth = True
    compressed_fields = True
    
    actions_row  = ["approve_request", "reject_request"]
    @action(description="Approve Request")
    def approve_request(self, request, object_id):
        if object_id:
            IdentityVerification.objects.filter(id=object_id).update(is_verified=True)
            messages.success(request, f"Định danh tính #{object_id} đã được phê duyệt thành công")
        # Return to the changelist view after action
        return HttpResponseRedirect(reverse('admin:rent_house_identityverification_changelist'))
    
    @action(description="Reject Request")
    def reject_request(self, request, object_id):
        if object_id:
            IdentityVerification.objects.filter(id=object_id).update(is_verified=False)
            messages.success(request, f"Định danh tính #{object_id} đã bị từ chối")
        # Return to the changelist view after action
        return HttpResponseRedirect(reverse('admin:rent_house_identityverification_changelist'))
    
    
    fieldsets = (
        (None, {
            'fields': ('user', 'display_avatar', 'id_number', 'is_verified')
        }),
        ('Verification Images', {
            'fields': ('display_id_front', 'display_id_back', 'display_selfie')
        }),
        ('Admin Section', {
            'fields': ('admin_notes', 'rejection_reason')
        }),
    )
    
    def display_avatar(self, obj):
        if obj.user.avatar:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%;" />', obj.user.avatar)
        return "No Avatar"
    display_avatar.short_description = 'Avatar'
    
    def display_id_front(self, obj):
        front_id = obj.get_front_id_image()
        if front_id:
            return format_html('<img src="{}" width="600" />', front_id.url)
        return "No ID Front Image"
    display_id_front.short_description = 'ID Front'
    
    def display_id_back(self, obj):
        back_id = obj.get_back_id_image()
        if back_id:
            return format_html('<img src="{}" width="600" />', back_id.url)
        return "No ID Back Image"
    display_id_back.short_description = 'ID Back'
    
    def display_selfie(self, obj):
        selfie = obj.get_selfie_image()
        if selfie:
            return format_html('<img src="{}" width="600" />', selfie.url)
        return "No Selfie Image"
    display_selfie.short_description = 'Selfie'


@admin.register(Report)
class ReportAdmin(ModelAdmin):
    list_display = ('id', 'reporter', 'reported_user','has_ban', 'reason', 'is_resolved', 'created_at')
    search_fields = ('reporter__username', 'reported_user__username', 'reason')
    list_filter = ('is_resolved', 'created_at')
    readonly_fields = ('reporter', 'reported_user', 'reason', 'created_at')
    ordering = ('-created_at',)

    def has_ban(self, obj):
        if obj.reported_user:
            return "❌ Chưa" if obj.reported_user.is_active else "✅ Đã cấm"
        return "N/A"

    actions_list = ["resolve_all"]
    @action(description="Giải quyết tất cả")
    def resolve_all(self, request):
        Report.objects.filter(is_resolved=False).update(is_resolved=True)
        messages.success(request, "Tất cả báo cáo chưa giải quyết đã được đánh dấu là đã giải quyết.")
        return HttpResponseRedirect(reverse('admin:rent_house_report_changelist'))
    
    actions_submit_line = ["ban"]
    @action(description="Cấm người dùng bị báo cáo")
    def ban(self, request, obj):
        if obj.reported_user:
            user = obj.reported_user
            user.is_active = False
            obj.is_resolved = True
            obj.save()
            user.save()
            messages.success(request, f"Người dùng {user.username} đã bị cấm.")
        else:
            messages.error(request, "Không thể cấm người dùng không xác định.")
        return HttpResponseRedirect(reverse('admin:rent_house_report_changelist'))

@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    list_display = ('id', 'display_avatar', 'get_full_name', 'username', 'email', 'phone_number', 'role', 'is_active', 'is_staff', 'is_verified')
    search_fields = ('username', 'email', 'phone_number', 'first_name', 'last_name')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'role', 'date_joined')
    readonly_fields = ('last_login', 'date_joined', 'display_avatar')
    ordering = ('-date_joined',)
    
    actions_row = ["toggle_active_status", "promote_to_owner"]
    
    @action(description="Toggle Active Status")
    def toggle_active_status(self, request, object_id):
        user = User.objects.get(id=object_id)
        user.is_active = not user.is_active
        user.save()
        status = "activated" if user.is_active else "deactivated"
        messages.success(request, f"User {user.username} has been {status}.")
        return HttpResponseRedirect(reverse('admin:rent_house_user_changelist'))
    
    @action(description="Promote to Owner")
    def promote_to_owner(self, request, object_id):
        from ..models import Role
        user = User.objects.get(id=object_id)
        user.role = Role.OWNER.value[0]
        user.save()
        messages.success(request, f"User {user.username} has been promoted to Owner role.")
        return HttpResponseRedirect(reverse('admin:rent_house_user_changelist'))

    @display(description="Verified")
    def is_verified(self, obj):
        is_verified = obj.is_identity_verified() if hasattr(obj, 'is_identity_verified') else False
        if is_verified:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': ('avatar', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'address')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    def display_avatar(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%;" />', obj.avatar)
        return "No Avatar"

    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

@admin.register(House)
class HouseAdmin(ModelAdmin):
    list_display = ('id', 'display_thumbnail', 'title', 'owner', 'address_snippet', 'type', 'is_verified', 'is_renting', 'created_at')
    search_fields = ('title', 'owner__username', 'address')
    list_filter = ('is_verified', 'is_renting', 'type', 'created_at')
    readonly_fields = ('display_thumbnail', 'display_images', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
    actions_row = ["verify_house", "toggle_renting_status"]
    
    @action(description="Verify House")
    def verify_house(self, request, object_id):
        house = House.objects.get(id=object_id)
        house.is_verified = True
        house.save()
        messages.success(request, f"House '{house.title}' has been verified.")
        return HttpResponseRedirect(reverse('admin:rent_house_house_changelist'))
    
    @action(description="Toggle Renting Status")
    def toggle_renting_status(self, request, object_id):
        house = House.objects.get(id=object_id)
        house.is_renting = not house.is_renting
        house.save()
        status = "available for rent" if house.is_renting else "not available for rent"
        messages.success(request, f"House '{house.title}' is now {status}.")
        return HttpResponseRedirect(reverse('admin:rent_house_house_changelist'))
    
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
    
    def address_snippet(self, obj):
        if obj.address and len(obj.address) > 40:
            return f"{obj.address[:40]}..."
        return obj.address
    address_snippet.short_description = 'Address'
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'owner', 'type')
        }),
        ('Location', {
            'fields': ('address', 'latitude', 'longitude')
        }),
        ('Pricing', {
            'fields': ('base_price', 'water_price', 'electricity_price', 'internet_price', 'trash_price', 'deposit')
        }),
        ('Status', {
            'fields': ('is_verified', 'is_renting')
        }),
        ('Property Details', {
            'fields': ('area', 'max_rooms', 'current_rooms', 'max_people')
        }),
        ('Images', {
            'fields': ('display_thumbnail', 'display_images')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(Post)
class PostAdmin(ModelAdmin):
    list_display = ('id', 'display_thumbnail', 'title_or_content_preview', 'author', 'type', 'likes_count', 'comments_count', 'is_active', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    list_filter = ('type', 'is_active', 'created_at')
    readonly_fields = ('display_thumbnail', 'display_images', 'likes_count', 'comments_count', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
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
    
    def likes_count(self, obj):
        return obj.get_interaction_count(interaction_type='like')
    likes_count.short_description = 'Likes'
    
    def comments_count(self, obj):
        return obj.get_comment_count()
    comments_count.short_description = 'Comments'
    
    fieldsets = (
        (None, {
            'fields': ('author', 'type', 'title', 'content', 'house_link', 'is_active')
        }),
        ('Location', {
            'fields': ('address', 'latitude', 'longitude')
        }),
        ('Images', {
            'fields': ('display_thumbnail', 'display_images')
        }),
        ('Engagement', {
            'fields': ('likes_count', 'comments_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(ChatGroup)
class ChatGroupAdmin(ModelAdmin):
    list_display = ('id', 'display_name', 'is_group', 'members_count', 'messages_count', 'last_message_date', 'created_at')
    search_fields = ('name', 'members__username')
    list_filter = ('is_group', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'display_members')
    ordering = ('-created_at',)
    
    def display_name(self, obj):
        if obj.name:
            return obj.name
        if not obj.is_group:
            members = obj.members.all()[:2]
            if len(members) == 2:
                return f"Chat between {members[0].username} and {members[1].username}"
        return f"Chat group {obj.id}"
    display_name.short_description = 'Name'
    
    def members_count(self, obj):
        return obj.members.count()
    members_count.short_description = 'Members'
    
    def messages_count(self, obj):
        return obj.messages.count()
    messages_count.short_description = 'Messages'
    
    def last_message_date(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return last_message.created_at
        return None
    last_message_date.short_description = 'Last Message'
    
    def display_members(self, obj):
        members = obj.members.all()
        if members:
            html = '<ul>'
            for member in members:
                html += f'<li>{member.username} ({member.email})</li>'
            html += '</ul>'
            return format_html(html)
        return "No members"
    display_members.short_description = 'Members'
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_group', 'created_by')
        }),
        ('Members', {
            'fields': ('display_members',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
