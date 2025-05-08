from rest_framework import viewsets, permissions, parsers, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType

from rent_house.models import Room, House, Media
from rent_house.serializers import RoomSerializer, RoomDetailSerializer
from rent_house.permissions import IsOwnerOfHouseOrReadOnly, IsOwnerRoleOrReadOnly
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image

class RoomViewSet(viewsets.ModelViewSet):
    """ViewSet để quản lý Room (phòng trong House)"""
    queryset = Room.objects.all()
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'house__title', 'house__address']
    ordering_fields = ['price', 'area', 'created_at']
    ordering = ['price']
    
    def get_serializer_class(self):
        """Sử dụng serializer chi tiết cho action retrieve"""
        if self.action == 'retrieve':
            return RoomDetailSerializer
        return RoomSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires:
        - Xem không cần đăng nhập
        - Tạo mới chỉ cho user với role OWNER
        - Sửa/xóa chỉ cho chủ sở hữu của house chứa room
        """
        if self.action in ['create']:
            permission_classes = [IsOwnerRoleOrReadOnly]
        elif self.action in ['update', 'partial_update', 'destroy', 'add_image', 'remove_image']:
            permission_classes = [IsOwnerOfHouseOrReadOnly]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter rooms theo các tham số"""
        queryset = super().get_queryset()
        
        # Filter theo house
        house_id = self.request.query_params.get('house_id')
        if house_id:
            queryset = queryset.filter(house_id=house_id)
            
        # Filter theo giá phòng
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # Filter các phòng còn chỗ trống
        available = self.request.query_params.get('available')
        if available and available.lower() == 'true':
            queryset = queryset.filter(cur_people__lt=models.F('max_people'))
            
        # Filter theo số người tối đa
        max_people = self.request.query_params.get('max_people')
        if max_people:
            queryset = queryset.filter(max_people__gte=max_people)
            
        # Filter theo diện tích
        min_area = self.request.query_params.get('min_area')
        if min_area:
            queryset = queryset.filter(area__gte=min_area)
            
        return queryset
    
    def perform_create(self, serializer):
        """Khi tạo room"""
        # Validate: Chỉ có thể tạo room trong house của mình
        house_id = self.request.data.get('house')
        try:
            house = House.objects.get(id=house_id)
            if house.owner != self.request.user:
                return Response(
                    {"error": "Bạn không thể thêm phòng vào ngôi nhà không thuộc sở hữu của mình"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except House.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy ngôi nhà"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        room = serializer.save()
        self.handle_images(room)
        return room
        
    def perform_update(self, serializer):
        """Khi cập nhật room"""
        room = serializer.save()
        self.handle_images(room)
        return room
    
    def handle_images(self, room):
        """Xử lý tải lên hình ảnh cho room"""
        # Xử lý file ảnh
        images = self.request.FILES.getlist('images')
        if images:
            for image in images:
                image_url = upload_image_to_cloudinary(image, folder="room_images")
                if image_url:
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Room),
                        object_id=room.id,
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
                    image_url = upload_image_to_cloudinary(base64_image, folder="room_images")
                    if image_url:
                        Media.objects.create(
                            content_type=ContentType.objects.get_for_model(Room),
                            object_id=room.id,
                            url=image_url,
                            media_type='image',
                            purpose='gallery',
                            public_id=image_url.split('/')[-1].split('.')[0]
                        )
                except Exception as e:
                    print(f"Lỗi khi xử lý ảnh base64: {e}")
    
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        """Thêm ảnh cho room"""
        room = self.get_object()
        images = request.FILES.getlist('images')
        
        if not images:
            return Response({"error": "Không có ảnh được cung cấp"}, status=400)
            
        media_items = []
        for image in images:
            image_url = upload_image_to_cloudinary(image, folder="room_images")
            if image_url:
                media = Media.objects.create(
                    content_type=ContentType.objects.get_for_model(Room),
                    object_id=room.id,
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
        """Xóa ảnh của room"""
        room = self.get_object()
        media_id = request.data.get('media_id')
        
        if not media_id:
            return Response({"error": "Cần cung cấp media_id"}, status=400)
            
        try:
            media = Media.objects.get(
                id=media_id,
                content_type=ContentType.objects.get_for_model(Room),
                object_id=room.id
            )
            
            if media.url and 'cloudinary' in media.url:
                delete_cloudinary_image(media.url)
                
            media.delete()
            return Response({"status": "success", "message": "Đã xóa ảnh"})
            
        except Media.DoesNotExist:
            return Response({"error": "Không tìm thấy ảnh"}, status=404)
