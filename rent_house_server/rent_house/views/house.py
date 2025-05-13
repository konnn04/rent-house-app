from rest_framework import viewsets, parsers, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, Q

from rent_house.models import House, Room, Media, User
from rent_house.serializers import HouseSerializer, HouseDetailSerializer, RoomSerializer
from rent_house.permissions import IsOwnerOfHouseOrReadOnly, IsOwnerRoleOrReadOnly
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image

from django.shortcuts import get_object_or_404

class HouseViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý House (nhà/căn hộ)"""
    queryset = House.objects.all()
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'address', 'type']
    ordering_fields = ['created_at', 'base_price']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Sử dụng serializer chi tiết cho action retrieve"""
        if self.action == 'retrieve':
            return HouseDetailSerializer
        return HouseSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires:
        - Xem không cần đăng nhập
        - Tạo mới chỉ cho user với role OWNER
        - Sửa/xóa chỉ cho chủ sở hữu của house
        """
        if self.action in ['create']:
            permission_classes = [IsOwnerRoleOrReadOnly]
        elif self.action in ['update', 'partial_update', 'destroy', 'add_image', 'remove_image']:
            permission_classes = [IsOwnerOfHouseOrReadOnly]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter houses theo các tham số"""
        queryset = super().get_queryset()
        
        # Filter theo house_type
        house_type = self.request.query_params.get('type')
        if house_type:
            queryset = queryset.filter(type=house_type)
            
        # Filter theo giá
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
            
        # Filter theo khu vực
        area = self.request.query_params.get('area')
        if area:
            queryset = queryset.filter(address__icontains=area)
            
        # Filter theo số user sở hữu
        owner_username = self.request.query_params.get('owner_username')
        if owner_username:
            queryset = queryset.filter(owner__username=owner_username)

        # Filter theo số phòng có sẵn
        has_rooms = self.request.query_params.get('has_rooms')
        if has_rooms and has_rooms.lower() == 'true':
            queryset = queryset.annotate(
                available_count=Count('rooms', filter=Q(rooms__cur_people__lt=rooms__max_people))
            ).filter(available_count__gt=0)

        return queryset
    
    def perform_create(self, serializer):
        """Khi tạo house, tự động gán người tạo là owner"""
        house = serializer.save(owner=self.request.user)
        self.handle_images(house)
        return house
        
    def perform_update(self, serializer):
        """Khi cập nhật house"""
        house = serializer.save()
        self.handle_images(house)
        return house
    
    def handle_images(self, house):
        """Xử lý tải lên hình ảnh cho house"""
        # Xử lý file ảnh
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
        
        # Xử lý ảnh base64 nếu có
        base64_images = self.request.data.getlist('base64_images', [])
        if base64_images:
            for base64_image in base64_images:
                try:
                    image_url = upload_image_to_cloudinary(base64_image, folder="house_images")
                    if image_url:
                        Media.objects.create(
                            content_type=ContentType.objects.get_for_model(House),
                            object_id=house.id,
                            url=image_url,
                            media_type='image',
                            purpose='gallery',
                            public_id=image_url.split('/')[-1].split('.')[0]
                        )
                except Exception as e:
                    print(f"Lỗi khi xử lý ảnh base64: {e}")
    
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        """Thêm ảnh cho house"""
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
        """Xóa ảnh của house"""
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
        """Lấy danh sách house của người dùng hiện tại"""
        if not request.user.is_authenticated:
            return Response({"error": "Bạn cần đăng nhập"}, status=401)
            
        houses = House.objects.filter(owner=request.user).order_by('-created_at')
        page = self.paginate_queryset(houses)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(houses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        """Lấy danh sách các phòng trong một house"""
        house = self.get_object()
        rooms = Room.objects.filter(house=house)
        
        # Filter phòng còn chỗ trống
        available_only = request.query_params.get('available_only')
        if available_only and available_only.lower() == 'true':
            rooms = rooms.filter(cur_people__lt=max_people)
            
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    
