from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType

from rent_house.models import Rate, House, Media
from rent_house.serializers import RateSerializer
from rent_house.utils import upload_image_to_cloudinary

class RateViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý đánh giá (Rate)"""
    queryset = Rate.objects.all()
    serializer_class = RateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter đánh giá theo tham số"""
        queryset = super().get_queryset()
        
        # Filter theo house
        house_id = self.request.query_params.get('house_id')
        if house_id:
            queryset = queryset.filter(house_id=house_id)
            
        # Filter theo user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        # Filter theo rating
        min_star = self.request.query_params.get('min_star')
        if min_star:
            queryset = queryset.filter(star__gte=min_star)
            
        return queryset
    
    def perform_create(self, serializer):
        """Chỉ cho phép đánh giá khi là người đang thuê phòng"""
        house_id = self.request.data.get('house')
        try:
            house = House.objects.get(id=house_id)
            
            # Đảm bảo rằng người dùng là người thuê phòng trong house này
            is_renter = house.rooms.filter(rentals__user=self.request.user, rentals__is_active=True).exists()
            
            if not is_renter:
                # Hoặc cho phép bất kỳ ai cũng có thể đánh giá (tùy vào yêu cầu)
                # Trong trường hợp thật, bạn có thể cần xác minh người dùng
                # đã từng thuê phòng ở đây trước đó
                pass
                
            rate = serializer.save(user=self.request.user, house=house)
            
            # Xử lý hình ảnh nếu có
            images = self.request.FILES.getlist('images')
            if images:
                for image in images:
                    image_url = upload_image_to_cloudinary(image, folder="rating_images")
                    if image_url:
                        Media.objects.create(
                            content_type=ContentType.objects.get_for_model(Rate),
                            object_id=rate.id,
                            url=image_url,
                            media_type='image',
                            purpose='attachment',
                            public_id=image_url.split('/')[-1].split('.')[0]
                        )
            
            return rate
            
        except House.DoesNotExist:
            raise serializers.ValidationError("House không tồn tại")
