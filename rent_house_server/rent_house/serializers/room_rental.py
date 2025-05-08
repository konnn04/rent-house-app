from rest_framework import serializers
from rent_house.models import RoomRental
from .user import UserSummarySerializer
from .room import RoomSerializer

class RoomRentalSerializer(serializers.ModelSerializer):
    user_detail = UserSummarySerializer(source='user', read_only=True)
    room_detail = RoomSerializer(source='room', read_only=True)
    
    class Meta:
        model = RoomRental
        fields = ('id', 'user', 'room', 'start_date', 'end_date', 'is_active', 
                 'price_agreed', 'created_at', 'updated_at', 'user_detail', 'room_detail')
        read_only_fields = ('id', 'created_at', 'updated_at')
