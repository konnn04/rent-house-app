from rest_framework import serializers
from rent_house.models import User

class UserSummarySerializer(serializers.ModelSerializer):
    """Serializer for displaying basic user information in nested representations"""
    full_name = serializers.SerializerMethodField()
    avatar_thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'avatar', 'avatar_thumbnail', 'role')
        
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

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'address', 'avatar', 'is_active', 'is_staff', 'is_superuser', 'password')
        read_only_fields = ('id', 'is_active', 'is_staff', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }
