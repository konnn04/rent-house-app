from rest_framework import serializers
from rent_house.models import Comment
from .user import UserSummarySerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)
    reply_count = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'parent', 'content', 'created_at', 'updated_at', 'reply_count', 'media')
        read_only_fields = ('id', 'post', 'created_at', 'updated_at')
    
    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nội dung bình luận không được để trống.")
        return value.strip()
        
    def get_reply_count(self, obj):
        return obj.replies.count()
        
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

class CommentDetailSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    author = UserSummarySerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'parent', 'content', 'created_at', 'updated_at', 'replies')
        read_only_fields = ('id', 'post', 'created_at', 'updated_at')
    
    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nội dung bình luận không được để trống.")
        return value.strip()

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True, context=self.context).data
