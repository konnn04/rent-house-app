from rest_framework import serializers
from rent_house.models import User
from django.db.models import Avg, Count
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rent_house.serializers.post import PostSerializer

class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'avatar', 'avatar_thumbnail', 'role','email', 'phone_number', 'address', 'is_active', 'first_name', 'last_name')
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_avatar_thumbnail(self, obj):
        if not obj.avatar:
            return None
        
        if 'res.cloudinary.com' in obj.avatar:
            parts = obj.avatar.split('/upload/')
            if len(parts) == 2:
                base_url, image_part = parts
                return f"{base_url}/upload/w_150,h_150,c_fill/{image_part}"
        
        return obj.avatar


class DetailedProfileSerializer(ProfileSerializer):
    post_count = serializers.SerializerMethodField()
    joined_date = serializers.DateTimeField(source='date_joined', read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    house_count = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()
    houses = serializers.SerializerMethodField()
    
    class Meta(ProfileSerializer.Meta):
        fields = ProfileSerializer.Meta.fields + (
            'post_count', 'joined_date', 'follower_count', 'following_count', 
            'avg_rating', 'house_count', 'room_count', 'email', 'phone_number',
            'address', 'is_active'
        )
        read_only_fields = ('joined_date', 'post_count', 'follower_count', 
                           'following_count', 'avg_rating', 'house_count', 
                           'room_count')
    
    def get_post_count(self, obj):
        return obj.posts.count()
    
    def get_follower_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_avg_rating(self, obj):
        if obj.role != 'owner':
            return None
        houses = obj.houses.all()
        if not houses.exists():
            return None
        avg = houses.aggregate(total_avg=serializers.Avg('ratings__star'))
        return avg['total_avg']

    def get_house_count(self, obj):
        if obj.role != 'owner':
            return None
        return obj.houses.count()

    def get_room_count(self, obj):
        return None
    
    def get_posts(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        posts = obj.posts.all()
        serializer = PostSerializer(posts, many=True, context=self.context)
        return serializer.data


class PublicProfileSerializer(ProfileSerializer):
    post_count = serializers.SerializerMethodField()
    joined_date = serializers.DateTimeField(source='date_joined', read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()
    is_verified = serializers.BooleanField(source='is_identity_verified', read_only=True)
    
    class Meta(ProfileSerializer.Meta):
        fields = ProfileSerializer.Meta.fields + (
            'post_count', 'joined_date', 'follower_count', 'following_count', 
            'avg_rating', 'is_followed', 'is_verified'
        )
    
    def get_post_count(self, obj):
        return obj.posts.count()
    
    def get_follower_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_avg_rating(self, obj):
        if obj.role != 'owner':
            return None
        
        houses = obj.houses.all()
        if not houses.exists():
            return None
            
        avg = houses.annotate(avg=Avg('ratings__star')).aggregate(total_avg=Avg('avg'))
        return avg['total_avg']
    
    def get_is_followed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        if request.user.id == obj.id:
            return False
        
        is_followed = obj.followers.filter(Q(follower=request.user) & Q(is_following=True)).exists()
        return is_followed