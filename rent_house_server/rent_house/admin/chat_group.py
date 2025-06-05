from django.contrib import admin
from django.utils.html import format_html

from unfold.admin import ModelAdmin

from ..models import ChatGroup


@admin.register(ChatGroup)
class ChatGroupAdmin(ModelAdmin):
    list_display = ('id', 'display_name', 'is_group', 'members_count', 'messages_count', 'last_message_date', 'created_at')
    search_fields = ('name', 'members__username')
    list_filter = ('is_group', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'display_members')
    ordering = ('-created_at',)
    list_filter_sheet = True
    list_filter_submit = True

    
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
