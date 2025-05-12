from rest_framework import serializers
from rent_house.models import User
from django.db.models import Avg, Count
from django.contrib.contenttypes.models import ContentType

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for displaying user profile information"""
    full_name = serializers.SerializerMethodField()
    avatar_thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'avatar', 'avatar_thumbnail', 'role','email', 'phone_number', 'address', 'is_active', 'first_name', 'last_name')
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_avatar_thumbnail(self, obj):
        """Return a thumbnail version of the user's avatar"""
        if not obj.avatar:
            return None
        
        if 'res.cloudinary.com' in obj.avatar:
            parts = obj.avatar.split('/upload/')
            if len(parts) == 2:
                base_url, image_part = parts
                return f"{base_url}/upload/w_150,h_150,c_fill/{image_part}"
        
        return obj.avatar


class DetailedProfileSerializer(ProfileSerializer):
    """Serializer cho hiển thị thông tin chi tiết profile người dùng"""
    post_count = serializers.SerializerMethodField()
    joined_date = serializers.DateTimeField(source='date_joined', read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    house_count = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    
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
        """Trả về số lượng bài đăng của người dùng"""
        return obj.posts.count()
    
    def get_follower_count(self, obj):
        """Trả về số lượng người theo dõi"""
        return obj.followers.count()
    
    def get_following_count(self, obj):
        """Trả về số lượng người đang theo dõi"""
        return obj.following.count()
    
    def get_avg_rating(self, obj):
        """Trả về đánh giá trung bình nếu người dùng là chủ sở hữu"""
        if obj.role != 'owner':
            return None
        
        return None
    
    def get_house_count(self, obj):
        """Trả về số lượng nhà/căn hộ nếu người dùng là chủ sở hữu"""
        if obj.role != 'owner':
            return None
        return obj.houses.count()
    
    def get_room_count(self, obj):
        """Trả về tổng số phòng từ tất cả các nhà/căn hộ của chủ sở hữu"""
        if obj.role != 'owner':
            return None
        # Tính tổng số phòng từ tất cả nhà/căn hộ
        return sum(house.rooms.count() for house in obj.houses.all())


class PublicProfileSerializer(ProfileSerializer):
    """Serializer cho hiển thị thông tin profile người dùng công khai"""
    post_count = serializers.SerializerMethodField()
    joined_date = serializers.DateTimeField(source='date_joined', read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()
    
    class Meta(ProfileSerializer.Meta):
        fields = ProfileSerializer.Meta.fields + (
            'post_count', 'joined_date', 'follower_count', 'following_count', 
            'avg_rating', 'is_followed'
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
            
        avg = houses.annotate(avg=Avg('rates__star')).aggregate(total_avg=Avg('avg'))
        return avg['total_avg']
    
    def get_is_followed(self, obj):
        """Kiểm tra xem người dùng hiện tại có đang theo dõi profile này không"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Nếu đang xem profile của chính mình
        if request.user.id == obj.id:
            return False
            
        return request.user.following.filter(followee=obj).exists()