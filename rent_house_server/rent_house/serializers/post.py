from rest_framework import serializers
from rent_house.models import Post, Follow, Interaction
from .user import UserSummarySerializer
from .comment import CommentSerializer

class PostSerializer(serializers.ModelSerializer):
    interaction = serializers.SerializerMethodField()
    is_followed_owner = serializers.SerializerMethodField()
    author = UserSummarySerializer(read_only=True)
    comment_count = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ('id', 'author', 'type', 'title', 'content', 'address', 'latitude', 'longitude', 
        'created_at', 'updated_at', 'house_link', 'interaction', 
        'is_followed_owner', 'comment_count', 'media', 'is_active', 'like_count', 'dislike_count')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_like_count(self, obj):
        return obj.interaction_set.filter(type='like').count()
    
    def get_dislike_count(self, obj):
        return obj.interaction_set.filter(type='dislike').count()

    def get_comment_count(self, obj):
        return obj.comments.count()
    
    def get_interaction(self, obj):
        """Get current user's interaction with this post if any"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        interaction = obj.interaction_set.filter(user=request.user).first()
        if interaction:
            return {
                'id': interaction.id,
                'type': interaction.type,
                'created_at': interaction.created_at,
                'updated_at': interaction.updated_at
            }
        return None
    
    def get_is_followed_owner(self, obj):
        """Check if current user is following the post author"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
            
        return Follow.objects.filter(
            follower=request.user, 
            followee=obj.author,
            is_following=True
        ).exists()
    
    def get_media(self, obj):
        """Get media attachments for this post"""
        media_items = []
        for media in obj.media_files.filter(media_type='image'):
            media_items.append({
                'id': media.id,
                'url': media.url,
                'thumbnail': media.get_url('thumbnail'),
                'medium': media.get_url('medium'),
                'type': media.media_type
            })
        return media_items

class PostDetailSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()
    interaction = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    is_followed_owner = serializers.SerializerMethodField()
    author = UserSummarySerializer(read_only=True)
    house_details = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author', 'type', 'title', 'content', 'address', 'latitude', 'longitude', 
                 'created_at', 'updated_at', 'house_link', 'house_details', 'comments', 
                 'like_count', 'dislike_count', 'interaction', 'is_followed_owner', 'comment_count', 
                 'media', 'is_active')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_comments(self, obj):
        """Get top-level comments with pagination if needed"""
        # Get only top-level comments (no parent)
        comments = obj.comments.filter(parent=None).order_by('-created_at')
        return CommentSerializer(comments, many=True, context=self.context).data
    
    def get_house_details(self, obj):
        """Get basic details about linked house if present"""
        if not obj.house_link:
            return None
        
        return {
            'id': obj.house_link.id,
            'title': obj.house_link.title,
            'address': obj.house_link.address,
            'type': obj.house_link.type,
            'thumbnail': obj.house_link.get_thumbnail(),
            'base_price': obj.house_link.base_price
        }
    
    def get_like_count(self, obj):
        return obj.interaction_set.filter(type='like').count()
    
    def get_dislike_count(self, obj):
        return obj.interaction_set.filter(type='dislike').count()
    
    def get_comment_count(self, obj):
        return obj.comments.count()
    
    def get_interaction(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        interaction = obj.interaction_set.filter(user=request.user).first()
        if interaction:
            return {
                'id': interaction.id,
                'type': interaction.type,
                'created_at': interaction.created_at,
                'updated_at': interaction.updated_at
            }
        return None
    
    def get_is_followed_owner(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
            
        return Follow.objects.filter(
            follower=request.user, 
            followee=obj.author,
            is_following=True
        ).exists()
    
    def get_media(self, obj):
        """Get media attachments for this post"""
        media_items = []
        for media in obj.media_files.filter(media_type='image'):
            media_items.append({
                'id': media.id,
                'url': media.url,
                'thumbnail': media.get_url('thumbnail'),
                'medium': media.get_url('medium'),
                'type': media.media_type
            })
        return media_items
