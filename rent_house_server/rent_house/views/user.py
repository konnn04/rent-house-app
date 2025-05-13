from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from rent_house.models import User
from rent_house.serializers import UserSerializer
from rent_house.firebase_utils import store_fcm_token, remove_fcm_token

from rent_house.utils import upload_image_to_cloudinary

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    @action(detail=False, methods=['get', 'patch'], url_path='current-user', permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name', 'phone_number', 'address']:
                    setattr(user, k, v)
            user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register_device(self, request):
        """Đăng ký FCM token cho thiết bị"""
        fcm_token = request.data.get('fcm_token')
        
        if not fcm_token:
            return Response({"error": "FCM token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        success = store_fcm_token(request.user.id, fcm_token)
        
        if success:
            return Response({"status": "Device registered successfully"})
        else:
            return Response({"error": "Failed to register device"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unregister_device(self, request):
        """Hủy đăng ký FCM token cho thiết bị"""
        fcm_token = request.data.get('fcm_token')
        
        if not fcm_token:
            return Response({"error": "FCM token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        success = remove_fcm_token(request.user.id, fcm_token)
        
        if success:
            return Response({"status": "Device unregistered successfully"})
        else:
            return Response({"error": "Failed to unregister device"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated], url_path='update-avatar')
    def update_avatar(self, request):
        """Cập nhật avatar người dùng"""
        user = request.user
        avatar = request.FILES.get('avatar')
        if not avatar:
            return Response({"error": "Avatar is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Upload the image to Cloudinary
        avatar_url = upload_image_to_cloudinary(avatar)
        if not avatar_url:
            return Response({"error": "Failed to upload image"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Update the user's avatar
        user.avatar = avatar_url
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
