from rest_framework import serializers
from rent_house.models import Follow, User
from .user import UserSummarySerializer

class FollowSerializer(serializers.ModelSerializer):
    is_following = serializers.BooleanField(required=False, default=True)
    user_detail = UserSummarySerializer(source='followee', read_only=True)
    
    class Meta:
        model = Follow
        fields = ('id', 'followee', 'is_following', 'created_at', 'updated_at', 'user_detail')
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'followee': {'required': False, 'write_only': True}
        }