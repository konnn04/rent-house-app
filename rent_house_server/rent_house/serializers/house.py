from rest_framework import serializers
from rent_house.models import House, Media
from .room import RoomSerializer
from .user import UserSummarySerializer
from django.contrib.contenttypes.models import ContentType

class HouseSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = House
        fields = ('id', 'owner', 'title', 'address', 'latitude', 'longitude', 
                  'created_at', 'updated_at', 'base_price', 'type', 'thumbnail')
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner')
    
    def get_thumbnail(self, obj):
        """Lấy thumbnail từ ảnh đầu tiên của house"""
        return obj.get_thumbnail()

class HouseDetailSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    owner = UserSummarySerializer(read_only=True)
    media = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    available_rooms = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = House
        fields = ('id', 'title', 'description', 'address', 'latitude', 'longitude', 
                 'rooms', 'created_at', 'updated_at', 'base_price', 'water_price', 
                 'electricity_price', 'internet_price', 'trash_price', 'is_verified', 
                 'owner', 'type', 'media', 'room_count', 'available_rooms', 'avg_rating')
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner')
        extra_kwargs = {
            'latitude': {'required': True},
            'longitude': {'required': True},
        }
    
    def get_media(self, obj):
        """Lấy tất cả media của house"""
        media_items = []
        for media in obj.media_files.filter(media_type='image'):
            media_items.append({
                'id': media.id,
                'url': media.url,
                'thumbnail': media.get_url('thumbnail'),
                'medium': media.get_url('medium'),
                'type': media.media_type,
                'purpose': media.purpose
            })
        return media_items
    
    def get_room_count(self, obj):
        """Lấy tổng số phòng"""
        return obj.get_room_count()
    
    def get_available_rooms(self, obj):
        """Lấy số phòng còn trống"""
        return obj.get_available_rooms().count()
    
    def get_avg_rating(self, obj):
        """Lấy đánh giá trung bình"""
        return obj.get_avg_rating()
