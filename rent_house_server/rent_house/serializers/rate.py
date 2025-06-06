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
    
    def validate_comment(self, value):
        content = value.strip() if value else ''
        if not content:
            raise serializers.ValidationError("Nội dung đánh giá không được để trống")
        if len(content) < 10:
            raise serializers.ValidationError("Nội dung đánh giá phải có ít nhất 10 ký tự")
        if len(content) > 1000:
            raise serializers.ValidationError("Nội dung đánh giá không được vượt quá 1000 ký tự")
        return content

    def validate_star(self, value):
        try:
            star = int(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError("Điểm đánh giá phải là số nguyên từ 1 đến 5")
        if star < 1 or star > 5:
            raise serializers.ValidationError("Điểm đánh giá phải từ 1 đến 5 sao")
        return star

    def get_media(self, obj):
        media_items = []
        for media in obj.media_files.filter(media_type='image'):
            media_items.append({
                'id': media.id,
                'url': media.url,
                'thumbnail': media.get_url('thumbnail'),
                'type': media.media_type
            })
        return media_items
