from rest_framework import viewsets, parsers, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from django.db.models import F, ExpressionWrapper, FloatField
from django.db.models.functions import Power, Sqrt
import math
from django.db.models import Q
from django.db.models.expressions import RawSQL
from rest_framework.exceptions import ValidationError
from django.db import transaction

from rent_house.models import House, Media
from rent_house.serializers.house import (
    HouseListSerializer, HouseDetailSerializer, HouseUpdateSerializer
)
from rent_house.permissions import IsOwnerOfHouseOrReadOnly, IsOwnerRoleOrReadOnly
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image

def haversine_sql(lat_origin, lon_origin):
    sql = """
        6371 * 2 * ASIN(
            SQRT(
                POWER(SIN(RADIANS(latitude - %s) / 2), 2) +
                COS(RADIANS(%s)) * COS(RADIANS(latitude)) *
                POWER(SIN(RADIANS(longitude - %s) / 2), 2)
            )
        )
    """
    params = [lat_origin, lat_origin, lon_origin]
    return RawSQL(sql, params, output_field=FloatField())
    

class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['created_at', 'base_price', 'updated_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return HouseListSerializer
        elif self.action == 'retrieve':
            return HouseDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return HouseUpdateSerializer
        return HouseListSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [IsOwnerRoleOrReadOnly]
        elif self.action in ['update', 'partial_update', 'destroy', 'add_image', 'remove_image']:
            permission_classes = [IsOwnerOfHouseOrReadOnly]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) | 
                Q(address__icontains=search)
            )

        house_type = self.request.query_params.get('type')
        if house_type:
            queryset = queryset.filter(type=house_type)

        is_verified = self.request.query_params.get('is_verified')
        if is_verified is not None:
            is_verified_bool = is_verified.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_verified=is_verified_bool)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)

        is_renting = self.request.query_params.get('is_renting')
        if is_renting is not None:
            is_renting_bool = is_renting.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_renting=is_renting_bool)

        is_blank = self.request.query_params.get('is_blank')
        if is_blank is not None and is_blank.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(
                max_rooms__isnull=False,
                current_rooms__lt=F('max_rooms')
            )
            
        lat = self.request.query_params.get('lat')
        lon = self.request.query_params.get('lon')
        has_distance = False
        if lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                queryset = queryset.annotate(distance=haversine_sql(lat, lon)).order_by('distance')
                has_distance = True
            except (ValueError, TypeError):
                pass
        
        sort_by = self.request.query_params.get('sort_by')
        if sort_by:
            if sort_by in ['base_price', '-base_price', 'created_at', '-created_at']:
                queryset = queryset.order_by(sort_by)
            elif sort_by == '-rating':
                from django.db.models import Avg
                queryset = queryset.annotate(
                    avg_rating=Avg('ratings__star')
                ).order_by('-avg_rating')
            elif sort_by == 'rating':
                from django.db.models import Avg
                queryset = queryset.annotate(
                    avg_rating=Avg('ratings__star')
                ).order_by('avg_rating')

        owner_username = self.request.query_params.get('owner_username')
        if owner_username:
            queryset = queryset.filter(owner__username=owner_username)

        max_people = self.request.query_params.get('max_people')
        if max_people:
            try:
                max_people_int = int(max_people)
                queryset = queryset.filter(max_people__gte=max_people_int)
            except ValueError:
                pass
        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        try:
            images = self.request.FILES.getlist('images') if hasattr(self.request.FILES, 'getlist') else []
            base64_images = self.request.data.get('base64_images', [])
            if isinstance(base64_images, str):
                import json
                try:
                    base64_images = json.loads(base64_images)
                except Exception:
                    base64_images = [base64_images]
            if not isinstance(base64_images, list):
                base64_images = [base64_images]
            total_images = len(images) + len([img for img in base64_images if img])

            if not self.request.user.can_create_house():
                raise ValidationError({
                    "message": "Bạn cần xác thực danh tính trước khi đăng tin nhà mới"
                })

            if len(images) < 3:
                raise ValidationError({"error": "Cần ít nhất 3 ảnh để đăng tin nhà mới"})
            
            house = serializer.save(owner=self.request.user)
            self.handle_images(house)

            # Tạo thông báo
            try:
                from rent_house.services.notification_service import house_notification
                house_notification(self.request.user, house)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Lỗi khi gửi thông báo có nhà mới: {str(e)}")

            return house
        except ValidationError as e:
            raise e
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Lỗi khi tạo nhà mới: {str(e)}")
            raise

    def perform_update(self, serializer):
        house = serializer.save()
        self.handle_images(house)
        return house

    def handle_images(self, house):
        images = self.request.FILES.getlist('images')
        if images:
            for image in images:
                image_url = upload_image_to_cloudinary(image, folder="house_images")
                if image_url:
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(House),
                        object_id=house.id,
                        url=image_url,
                        media_type='image',
                        purpose='gallery',
                        public_id=image_url.split('/')[-1].split('.')[0]
                    )

    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        house = self.get_object()
        images = request.FILES.getlist('images')

        if not images:
            return Response({"error": "Không có ảnh được cung cấp"}, status=400)

        media_items = []
        for image in images:
            image_url = upload_image_to_cloudinary(image, folder="house_images")
            if image_url:
                media = Media.objects.create(
                    content_type=ContentType.objects.get_for_model(House),
                    object_id=house.id,
                    url=image_url,
                    media_type='image',
                    purpose='gallery',
                    public_id=image_url.split('/')[-1].split('.')[0]
                )
                media_items.append({
                    'id': media.id,
                    'url': media.url,
                    'thumbnail': media.get_url('thumbnail')
                })

        return Response({
            'status': 'success',
            'message': f'Đã thêm {len(media_items)} ảnh',
            'media': media_items
        })

    @action(detail=True, methods=['delete'])
    def remove_image(self, request, pk=None):
        house = self.get_object()
        media_id = request.data.get('media_id')

        if not media_id:
            return Response({"error": "Cần cung cấp media_id"}, status=400)

        try:
            media = Media.objects.get(
                id=media_id,
                content_type=ContentType.objects.get_for_model(House),
                object_id=house.id
            )

            if media.url and 'cloudinary' in media.url:
                delete_cloudinary_image(media.url)

            media.delete()
            return Response({"status": "success", "message": "Đã xóa ảnh"})

        except Media.DoesNotExist:
            return Response({"error": "Không tìm thấy ảnh"}, status=404)

    @action(detail=False, methods=['get'])
    def my_houses(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Bạn cần đăng nhập"}, status=401)

        houses = House.objects.filter(owner=request.user).order_by('-created_at')
        page = self.paginate_queryset(houses)

        serializer = self.get_serializer(page, many=True) if page is not None else self.get_serializer(houses, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    def create(self, request, *args, **kwargs):
        if not request.user.can_create_house():
            return Response({
                "message": "Bạn cần xác thực danh tính trước khi đăng tin nhà mới"
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().create(request, *args, **kwargs)

