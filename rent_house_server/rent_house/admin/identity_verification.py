from django.contrib import admin
from django.utils.html import format_html
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse

from unfold.admin import ModelAdmin
from unfold.decorators import action
from unfold.contrib.filters.admin import BooleanRadioFilter, RangeDateFilter
from unfold.paginator import InfinitePaginator

from ..models import IdentityVerification


@admin.register(IdentityVerification)
class IdentityVerificationAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 20  
    list_display = ('id', 'display_avatar', 'user', 'id_number', 'is_verified', 'created_at')
    search_fields = ('user__username', 'id_number', 'user__email', 'user__phone_number')
    list_filter = [
        ('is_verified', BooleanRadioFilter),
        ('created_at', RangeDateFilter),
    ]
    readonly_fields = ('display_avatar', 'display_id_front', 'display_id_back', 'display_selfie', 'user')
    
    ordering = ('-created_at',)
    list_filter_sheet = True
    list_filter_submit = True
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
        return HttpResponseRedirect(reverse('admin:rent_house_identityverification_changelist'))
    
    @action(description="Reject Request")
    def reject_request(self, request, object_id):
        if object_id:
            IdentityVerification.objects.filter(id=object_id).update(is_verified=False)
            messages.success(request, f"Định danh tính #{object_id} đã bị từ chối")
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
