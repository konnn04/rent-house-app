from rest_framework import serializers
from django.db.models import Avg
from rent_house.models import User, IdentityVerification, Media
from django.contrib.contenttypes.models import ContentType

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
    is_verified = serializers.SerializerMethodField()
    has_identity = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ( 
            'id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'address', 'avatar', 'is_active', 'is_staff', 'is_superuser', 'password', 
            'post_count', 'joined_date', 'follower_count', 'following_count', 
            'avg_rating', 'house_count', 'room_count', 'is_verified', 'has_identity'
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
    
    def get_is_verified(self, obj):
        """Kiểm tra xem user có được xác thực bởi admin không"""
        return obj.is_identity_verified()
    
    def get_has_identity(self, obj):
        """Kiểm tra xem user đã nộp giấy tờ chưa"""
        return obj.has_submitted_identity()

class IdentityVerificationSerializer(serializers.ModelSerializer):
    front_id_image = serializers.SerializerMethodField()
    back_id_image = serializers.SerializerMethodField()
    selfie_image = serializers.SerializerMethodField()
    
    class Meta:
        model = IdentityVerification
        fields = ('id', 'id_number', 'is_verified', 'front_id_image', 'back_id_image', 
                 'selfie_image', 'created_at', 'updated_at')
        read_only_fields = ('is_verified',)
    
    def get_front_id_image(self, obj):
        front_image = obj.get_front_id_image()
        if front_image:
            return {
                'id': front_image.id,
                'url': front_image.url
            }
        return None
    
    def get_back_id_image(self, obj):
        back_image = obj.get_back_id_image()
        if back_image:
            return {
                'id': back_image.id,
                'url': back_image.url
            }
        return None
    
    def get_selfie_image(self, obj):
        selfie_image = obj.get_selfie_image()
        if selfie_image:
            return {
                'id': selfie_image.id,
                'url': selfie_image.url
            }
        return None
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        # Kiểm tra nếu user đã có hồ sơ xác thực
        if hasattr(user, 'identity_verification'):
            raise serializers.ValidationError({"detail": "Bạn đã nộp hồ sơ xác thực rồi"})
        
        # Tạo hồ sơ xác thực mới
        identity = IdentityVerification.objects.create(
            user=user,
            id_number=validated_data.get('id_number')
        )
        
        # Xử lý upload ảnh
        request = self.context.get('request')
        
        # Lưu ảnh mặt trước CCCD/CMND
        front_image = request.FILES.get('front_id_image')
        if front_image:
            from rent_house.utils import upload_image_to_cloudinary
            url = upload_image_to_cloudinary(front_image, folder="identity_verification")
            if url:
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(IdentityVerification),
                    object_id=identity.id,
                    url=url,
                    media_type='image',
                    purpose='id_front'
                )
        
        # Lưu ảnh mặt sau CCCD/CMND
        back_image = request.FILES.get('back_id_image')
        if back_image:
            from rent_house.utils import upload_image_to_cloudinary
            url = upload_image_to_cloudinary(back_image, folder="identity_verification")
            if url:
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(IdentityVerification),
                    object_id=identity.id,
                    url=url,
                    media_type='image',
                    purpose='id_back'
                )
        
        # Lưu ảnh chân dung (nếu có)
        selfie_image = request.FILES.get('selfie_image')
        if selfie_image:
            from rent_house.utils import upload_image_to_cloudinary
            url = upload_image_to_cloudinary(selfie_image, folder="identity_verification")
            if url:
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(IdentityVerification),
                    object_id=identity.id,
                    url=url,
                    media_type='image',
                    purpose='id_selfie'
                )
        
        return identity
