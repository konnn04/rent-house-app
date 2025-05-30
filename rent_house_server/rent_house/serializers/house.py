from rest_framework import serializers
from rent_house.models import House, Media, HouseType
from .user import UserSummarySerializer

class HouseListSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = (
            'id', 'owner', 'title', 'address', 'latitude', 'longitude',
            'created_at', 'updated_at', 'base_price', 'type', 'thumbnail',
            'max_rooms', 'current_rooms', 'max_people', 'avg_rating'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner')

    def get_thumbnail(self, obj):
        return obj.get_thumbnail()

    def get_avg_rating(self, obj):
        return obj.get_avg_rating()

class HouseDetailSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    media = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = (
            'id', 'title', 'description', 'address', 'latitude', 'longitude',
            'created_at', 'updated_at', 'base_price', 'water_price',
            'electricity_price', 'internet_price', 'trash_price', 'is_verified',
            'owner', 'type', 'media', 'max_rooms', 'current_rooms', 'max_people', 'avg_rating'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner')

    def get_media(self, obj):
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

    def get_avg_rating(self, obj):
        return obj.get_avg_rating()

class HouseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = (
            'title', 'description', 'address', 'latitude', 'longitude',
            'base_price', 'water_price', 'electricity_price',
            'internet_price', 'trash_price', 'type',
            'max_rooms', 'current_rooms', 'max_people'
        )

    def validate(self, data):
        house_type = data.get('type', getattr(self.instance, 'type', None))
        if house_type == HouseType.ROOM.value[0]:
            if data.get('max_rooms') is None or data.get('max_people') is None:
                raise serializers.ValidationError("Phải nhập max_rooms và max_people cho loại phòng trọ.")
        else:
            data['max_rooms'] = None
            data['current_rooms'] = None
            data['max_people'] = None
        return data