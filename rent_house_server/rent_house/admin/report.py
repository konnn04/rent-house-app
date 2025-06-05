from django.contrib import admin
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse

from unfold.admin import ModelAdmin
from unfold.decorators import action
from unfold.paginator import InfinitePaginator

from ..models import Report


@admin.register(Report)
class ReportAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 20  
    list_display = ('id', 'reporter', 'reported_user','has_ban', 'reason', 'is_resolved', 'created_at')
    search_fields = ('reporter__username', 'reported_user__username', 'reason')
    list_filter = ('is_resolved', 'created_at')
    readonly_fields = ('reporter', 'reported_user', 'reason', 'created_at')
    ordering = ('-created_at',)
    list_filter_sheet = False

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
