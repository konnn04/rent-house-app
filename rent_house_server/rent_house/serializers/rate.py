from rest_framework import serializers
from rent_house.models import Rate
from .user import UserSummarySerializer

class RateSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    media = serializers.SerializerMethodField()
    
    class Meta:
        model = Rate
        fields = ('id', 'user', 'house', 'star', 'comment', 'created_at', 'updated_at', 'media')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_media(self, obj):
        """Get media attachments for this rating"""
        media_items = []
        for media in obj.media_files.filter(media_type='image'):
            media_items.append({
                'id': media.id,
                'url': media.url,
                'thumbnail': media.get_url('thumbnail'),
                'type': media.media_type
            })
        return media_items
