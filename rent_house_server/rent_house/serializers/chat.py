from rest_framework import serializers
from rent_house.models import ChatGroup, ChatMembership, Message
from .user import UserSummarySerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)
    media = serializers.SerializerMethodField()
    replied_to_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ('id', 'chat_group', 'sender', 'content', 'is_system_message', 
                 'is_removed', 'replied_to', 'replied_to_preview', 'created_at', 
                 'updated_at', 'media')
        read_only_fields = ('id', 'is_system_message', 'created_at', 'updated_at')
        extra_kwargs = {
            'content': {'required': False, 'allow_blank': True},  # Cho phép content rỗng
        }
    
    def get_media(self, obj):
        """Get media attachments for this message"""
        media_items = []
        for media in obj.media_files.filter(media_type='image'):
            media_items.append({
                'id': media.id,
                'url': media.url,
                'thumbnail': media.get_url('thumbnail'),
                'type': media.media_type
            })
        return media_items
    
    def get_replied_to_preview(self, obj):
        """Get preview of replied message if any"""
        if not obj.replied_to:
            return None
            
        return {
            'id': obj.replied_to.id,
            'sender': UserSummarySerializer(obj.replied_to.sender).data,
            'content': obj.replied_to.get_formatted_content()[:100],
            'created_at': obj.replied_to.created_at
        }

class ChatMembershipSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMembership
        fields = ('id', 'chat_group', 'user', 'is_admin', 'nickname', 
                 'last_read_at', 'unread_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_unread_count(self, obj):
        return obj.get_unread_count()

class ChatGroupSerializer(serializers.ModelSerializer):
    members_summary = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatGroup
        fields = ('id', 'name', 'description', 'is_group', 'members_summary', 
                 'created_by', 'created_at', 'updated_at', 'last_message', 'unread_count')
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by', 'is_group')
    
    def get_members_summary(self, obj):
        """Get summary of chat members"""
        # Get top 3 members to show in preview
        members = obj.members.all()[:3]
        return UserSummarySerializer(members, many=True).data
    
    def get_last_message(self, obj):
        """Get the last message in the chat"""
        last_message = obj.messages.order_by('-created_at').first()
        if not last_message:
            return None
        return {
            'id': last_message.id,
            'sender': UserSummarySerializer(last_message.sender).data,
            'content': last_message.get_formatted_content()[:100],
            'created_at': last_message.created_at,
            'is_removed': last_message.is_removed
        }
    
    def get_unread_count(self, obj):
        """Get count of unread messages for the current user"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
            
        membership = obj.chat_memberships.filter(user=request.user).first()
        if not membership:
            return 0
            
        return membership.get_unread_count()

class ChatGroupDetailSerializer(ChatGroupSerializer):
    """Detailed serializer for chat groups including all members"""
    members = serializers.SerializerMethodField()
    
    class Meta(ChatGroupSerializer.Meta):
        fields = ChatGroupSerializer.Meta.fields + ('members',)
    
    def get_members(self, obj):
        """Get all members with their membership details"""
        memberships = obj.chat_memberships.all()
        return ChatMembershipSerializer(memberships, many=True).data
