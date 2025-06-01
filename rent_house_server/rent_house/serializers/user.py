from rest_framework import serializers
from django.db.models import Avg
from rent_house.models import User

class UserSummarySerializer(serializers.ModelSerializer):
    """Serializer for displaying basic user information in nested representations"""
    full_name = serializers.SerializerMethodField()
    avatar_thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'avatar', 'avatar_thumbnail', 'role', 'first_name', 'last_name')
        
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

class UserSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    joined_date = serializers.DateTimeField(source='date_joined', read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    house_count = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ( 
            'id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'address', 'avatar', 'is_active', 'is_staff', 'is_superuser', 'password', 
            'post_count', 'joined_date', 'follower_count', 'following_count', 
            'avg_rating', 'house_count', 'room_count'
        )
        read_only_fields = ('id', 'is_active', 'is_staff', 'is_superuser', 'email', 'post_count', 'joined_date', 'follower_count', 'following_count', 'avg_rating', 'house_count', 'room_count')

        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }
    
    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()
        return u
    
    def update(self, instance, validated_data):
        # Handle password specially if provided
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
    
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
        # Tính trung bình đánh giá của tất cả các house mà user sở hữu
        houses = obj.houses.all()
        if not houses.exists():
            return None
        avg = houses.aggregate(total_avg=Avg('ratings__star'))
        return avg['total_avg']

    def get_house_count(self, obj):
        """Trả về số lượng nhà/căn hộ nếu người dùng là chủ sở hữu"""
        if obj.role != 'owner':
            return None
        return obj.houses.count()

    def get_room_count(self, obj):
        """Trả về tổng số phòng từ tất cả các nhà/căn hộ của chủ sở hữu"""
        # Không còn model Room, trả về None hoặc 0
        return None
