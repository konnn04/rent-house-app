from rent_house.models import User, House, Room, Post, Comment, Interaction, Follow
from rest_framework import serializers

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'house', 'title', 'price', 'area', 'bedrooms', 'bathrooms')
        read_only_fields = ('id', 'house', 'created_at', 'updated_at')

class RoomDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'house', 'title', 'description', 'price', 'area', 'bedrooms', 'bathrooms', 'created_at', 'updated_at')
        read_only_fields = ('id', 'house', 'created_at', 'updated_at')

class HouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = ('id', 'title', 'address', 'latitude', 'longitude', 'created_at', 'updated_at', 'base_price', 'type')
        read_only_fields = ('id', 'created_at', 'updated_at')

class HouseDetailSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    class Meta:
        model = House
        fields = ('id', 'title', 'address', 'latitude', 'longitude', 'rooms', 'created_at', 'updated_at','base_price', 'water_price', 'electricity_price', 'internet_price', 'trash_price', 'is_verified', 'owner', 'type')
        read_only_fields = ('id', 'created_at', 'updated_at')
        read_only_fields = HouseSerializer.Meta.read_only_fields
        extra_kwargs = {
            'latitude': {'required': True},
            'longitude': {'required': True},
        }

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'parent', 'content', 'created_at', 'updated_at')
        read_only_fields = ('id', 'post', 'created_at', 'updated_at')

class CommentDetailSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'parent', 'content', 'created_at', 'updated_at', 'replies')
        read_only_fields = ('id', 'post', 'created_at', 'updated_at')

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data
    
class PostSerializer(serializers.ModelSerializer):
    interaction_count = serializers.SerializerMethodField()
    interaction = serializers.SerializerMethodField()
    is_followed_owner = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ('id', 'author', 'type', 'title', 'content', 'address', 'latitude', 'longitude', 'created_at', 'updated_at', 'house_link', 'interaction_count', 'interaction', 'is_followed_owner')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_interaction_count(self, obj):
        interactions = obj.interactions.all()
        return len(interactions)
    
    def get_interaction(self, obj):
        user = self.context['request'].user
        interaction = obj.interactions.filter(user=user).first()
        if interaction:
            return {
                'id': interaction.id,
                'type': interaction.type,
                'created_at': interaction.created_at,
                'updated_at': interaction.updated_at
            }
        return None
    
    def get_is_followed_owner(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            follow = Follow.objects.filter(follower=user, following=obj.author).first()
            return follow is not None
        return False
    

class PostDetailSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()
    interaction_count = serializers.SerializerMethodField()
    interaction = serializers.SerializerMethodField()
    is_followed_owner = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author', 'type', 'title', 'content', 'address', 'latitude', 'longitude', 'created_at', 'updated_at', 'house_link', 'comments', 'interaction_count', 'interaction', 'is_followed_owner')
        read_only_fields = ('id', 'created_at', 'updated_at')

class UserSerializer(serializers.ModelSerializer):   
    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()
        return u
    
    def update(self, instance, validated_data):
        # Xử lý password đặc biệt nếu được cung cấp
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        # Cập nhật các trường khác
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'address', 'avatar', 'is_active', 'is_staff', 'is_superuser', 'password')
        read_only_fields = ('id', 'is_active', 'is_staff', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }