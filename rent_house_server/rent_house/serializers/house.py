from rest_framework import serializers
from rent_house.models import House, Media, HouseType
from .user import UserSummarySerializer

class HouseSimpleSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = (
            'id', 'title', 'address', 'latitude', 'longitude',
            'created_at', 'updated_at', 'base_price', 'type', 'thumbnail',
            'max_rooms', 'current_rooms', 'max_people', 'area', 'deposit', 'is_renting', 'is_verified'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner')

    def get_thumbnail(self, obj):
        return obj.get_thumbnail()

class HouseListSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = (
            'id', 'owner', 'title', 'address', 'latitude', 'longitude',
            'created_at', 'updated_at', 'base_price', 'type', 'thumbnail',
            'max_rooms', 'current_rooms', 'max_people', 'avg_rating', 'area', 'deposit', 'is_renting', 'is_verified'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner', 'is_renting', 'is_verified')

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
            'owner', 'type', 'media', 'max_rooms', 'current_rooms', 'max_people', 'avg_rating', 'area', 'deposit', 'is_renting', 'is_verified'
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
            'max_rooms', 'current_rooms', 'max_people', 'area', 'deposit', 'is_renting'
        )

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Tiêu đề không được để trống.")
        return value

    def validate_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Địa chỉ không được để trống.")
        return value

    def validate_latitude(self, value):
        if value is None:
            raise serializers.ValidationError("Vĩ độ không được để trống.")
        if value < -90 or value > 90:
            raise serializers.ValidationError("Vĩ độ phải trong khoảng -90 đến 90.")
        return value

    def validate_longitude(self, value):
        if value is None:
            raise serializers.ValidationError("Kinh độ không được để trống.")
        if value < -180 or value > 180:
            raise serializers.ValidationError("Kinh độ phải trong khoảng -180 đến 180.")
        return value

    def validate_max_people(self, value):
        if value is None:
            raise serializers.ValidationError("Số người tối đa không được để trống.")
        if value <= 0:
            raise serializers.ValidationError("Số người tối đa phải lớn hơn 0.")
        return value

    def validate_area(self, value):
        if value is None:
            raise serializers.ValidationError("Diện tích không được để trống.")
        if value <= 0:
            raise serializers.ValidationError("Diện tích phải lớn hơn 0.")
        return value

    def validate_deposit(self, value):
        if value is None:
            raise serializers.ValidationError("Tiền cọc không được để trống.")
        if value < 0:
            raise serializers.ValidationError("Tiền cọc không được âm.")
        return value

    def validate_is_renting(self, value):
        if value is None:
            raise serializers.ValidationError("Trạng thái cho thuê không được để trống.")
        return value

    def validate_base_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Giá cơ bản không được âm.")
        return value

    def validate_water_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Giá nước không được âm.")
        return value

    def validate_electricity_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Giá điện không được âm.")
        return value

    def validate_internet_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Giá internet không được âm.")
        return value

    def validate_trash_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Giá rác không được âm.")
        return value

    def validate_max_rooms(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Số phòng tối đa phải lớn hơn 0.")
        return value

    def validate_current_rooms(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Số phòng hiện tại không được âm.")
        return value

    def validate(self, data):
        house_type = data.get('type', getattr(self.instance, 'type', None))
        if house_type == HouseType.ROOM.value[0]:
            if data.get('max_rooms') is None or data.get('max_people') is None:
                raise serializers.ValidationError("Phải nhập max_rooms và max_people cho loại phòng trọ.")
        else:
            data['max_rooms'] = None
            data['current_rooms'] = None
            data['max_people'] = None

        max_rooms = data.get('max_rooms', getattr(self.instance, 'max_rooms', None))
        current_rooms = data.get('current_rooms', getattr(self.instance, 'current_rooms', None))
        if max_rooms is not None and current_rooms is not None:
            if current_rooms > max_rooms:
                raise serializers.ValidationError("Số phòng hiện tại không được vượt quá số phòng tối đa.")

        return data