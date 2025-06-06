from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError

from rent_house.models import Rate, House, Media
from rent_house.serializers import RateSerializer
from rent_house.utils import upload_image_to_cloudinary

class RateViewSet(viewsets.ModelViewSet):
    queryset = Rate.objects.all()
    serializer_class = RateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    
    def get_queryset(self):
        queryset = super().get_queryset().filter(is_active=True)
        
        house_id = self.request.query_params.get('house_id')
        if house_id:
            queryset = queryset.filter(house_id=house_id)
            
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        min_star = self.request.query_params.get('min_star')
        if min_star:
            queryset = queryset.filter(star__gte=min_star)
            
        return queryset
    
    def perform_create(self, serializer):
        house_id = self.request.data.get('house')
        
        try:
            house = House.objects.get(id=house_id)

            rate = serializer.save(user=self.request.user, house=house)

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

            try:
                from rent_house.services.notification_service import rating_notification
                rating_notification(self.request.user, house)
            except Exception:
                pass

            return rate

        except House.DoesNotExist:
            raise ValidationError("Nhà cho thuê không tồn tại")
