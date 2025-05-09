from rest_framework import serializers
from rent_house.models import Room, House

class RoomSerializer(serializers.ModelSerializer):
    house_title = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ('id', 'house', 'house_title', 'title', 'price', 'area', 
                 'bedrooms', 'bathrooms', 'max_people', 'cur_people', 
                 'is_available', 'thumbnail')
        read_only_fields = ('id', 'house_title', 'is_available')
    
    def get_house_title(self, obj):
        return obj.house.title
    
    def get_is_available(self, obj):
        return obj.is_available()
    
    def get_thumbnail(self, obj):
        return obj.get_thumbnail()

class RoomDetailSerializer(serializers.ModelSerializer):
    house_title = serializers.SerializerMethodField()
    house_address = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ('id', 'house', 'house_title', 'house_address', 'title', 
                  'description', 'price', 'area', 'bedrooms', 'bathrooms', 
                  'max_people', 'cur_people', 'is_available', 'created_at', 
                  'updated_at', 'media')
        read_only_fields = ('id', 'house_title', 'house_address', 'is_available', 
                          'created_at', 'updated_at')
    
    def get_house_title(self, obj):
        return obj.house.title
    
    def get_house_address(self, obj):
        return obj.house.address
    
    def get_is_available(self, obj):
        return obj.is_available()
    
    def get_media(self, obj):
        """Lấy tất cả media của room"""
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
    
    def validate_house(self, house):
        """Kiểm tra xem người dùng có quyền thêm phòng vào house này không"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if house.owner != request.user:
                raise serializers.ValidationError("Bạn không thể thêm phòng vào nhà không thuộc sở hữu của mình")
        return house
