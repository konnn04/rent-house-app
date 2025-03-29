from rent_house.models import User, House, Room, Post, Comment, Interaction, Follow
from rest_framework import serializers

class HouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = ('id', 'title', 'address', 'latitude', 'longitude', 'created_date', 'updated_date')
        read_only_fields = ('id', 'created_date', 'updated_date')

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'house', 'title', 'price', 'area', 'bedrooms', 'bathrooms', 'created_date', 'updated_date')
        read_only_fields = ('id', 'created_date', 'updated_date')

class HouseDetailSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    class Meta:
        model = House
        fields = ('id', 'title', 'address', 'latitude', 'longitude', 'rooms', 'created_date', 'updated_date')
        read_only_fields = ('id', 'created_date', 'updated_date')

    class Meta:
        model = House
        fields = HouseSerializer.Meta.fields 
        read_only_fields = HouseSerializer.Meta.read_only_fields
        extra_kwargs = {
            'latitude': {'required': True},
            'longitude': {'required': True},
        }

class UserSerializer(serializers.ModelSerializer):   
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()

        return u

    class Meta:
        model = User
        fields = ( 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'address', 'avatar', 'is_active', 'is_staff', 'is_superuser')
        read_only_fields = ('id', 'is_active', 'is_staff', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True},
        }