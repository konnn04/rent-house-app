from rest_framework import serializers
from rent_house.models import Follow
from .user import UserSummarySerializer

class FollowSerializer(serializers.ModelSerializer):
    follower_detail = UserSummarySerializer(source='follower', read_only=True)
    followee_detail = UserSummarySerializer(source='followee', read_only=True)
    
    class Meta:
        model = Follow
        fields = ('id', 'follower', 'followee', 'is_following', 'created_at', 
                 'updated_at', 'follower_detail', 'followee_detail')
        read_only_fields = ('id', 'created_at', 'updated_at')
