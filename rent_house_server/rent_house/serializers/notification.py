from rest_framework import serializers
from rent_house.models import Notification
from .user import UserSummarySerializer

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ('id', 'user', 'content', 'url', 'type', 'is_read', 
                  'sender', 'related_object_type', 'related_object_id', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
