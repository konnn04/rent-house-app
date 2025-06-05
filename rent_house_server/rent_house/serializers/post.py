from rest_framework import serializers
from rent_house.models import Post, Follow, Interaction
from .user import UserSummarySerializer
from .comment import CommentSerializer
from .house import HouseSimpleSerializer

class PostSerializer(serializers.ModelSerializer):
    interaction = serializers.SerializerMethodField()
    is_followed_owner = serializers.SerializerMethodField()
    author = UserSummarySerializer(read_only=True)
    comment_count = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    house_link = HouseSimpleSerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = ('id', 'author', 'type', 'title', 'content', 'address', 'latitude', 'longitude', 
        'created_at', 'updated_at', 'house_link', 'interaction', 
        'is_followed_owner', 'comment_count', 'media', 'is_active', 'like_count', 'dislike_count')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nội dung không được để trống.")
        return value.strip()

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Tiêu đề không được để trống.")
        return value.strip()

    def validate_latitude(self, value):
        if value is not None and (value < -90 or value > 90):
            raise serializers.ValidationError("Vĩ độ phải nằm trong khoảng -90 đến 90 độ.")
        return value

    def validate_longitude(self, value):
        if value is not None and (value < -180 or value > 180):
            raise serializers.ValidationError("Kinh độ phải nằm trong khoảng -180 đến 180 độ.")
        return value

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
                 'created_at', 'updated_at', 'house_link', 'house_details', 
                 'like_count', 'dislike_count', 'interaction', 'is_followed_owner', 'comment_count', 
                 'media', 'is_active')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nội dung không được để trống.")
        return value.strip()

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Tiêu đề không được để trống.")
        return value.strip()

    def validate_latitude(self, value):
        if value is not None and (value < -90 or value > 90):
            raise serializers.ValidationError("Vĩ độ phải nằm trong khoảng -90 đến 90 độ.")
        return value

    def validate_longitude(self, value):
        if value is not None and (value < -180 or value > 180):
            raise serializers.ValidationError("Kinh độ phải nằm trong khoảng -180 đến 180 độ.")
        return value
    
    def get_house_details(self, obj):
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
