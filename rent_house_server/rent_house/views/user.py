from rest_framework import viewsets, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from rent_house.models import User, IdentityVerification
from rent_house.serializers import UserSerializer, IdentityVerificationSerializer

from rent_house.utils import upload_image_to_cloudinary
from rent_house.permissions import IsOwnerOrReadOnly

class UserViewSet(viewsets.ModelViewSet):
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

class IdentityVerificationViewSet(viewsets.ModelViewSet):
    """ViewSet để quản lý xác thực danh tính người dùng"""
    serializer_class = IdentityVerificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        # Admin có thể thấy tất cả, user chỉ thấy của mình
        user = self.request.user
        if user.is_staff or user.role == 'admin':
            return IdentityVerification.objects.all()
        return IdentityVerification.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        # Chỉ cho phép owner tạo hồ sơ xác thực
        if request.user.role != 'owner':
            return Response(
                {"detail": "Chỉ chủ nhà mới cần xác thực danh tính"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        # Chỉ admin mới được cập nhật trạng thái xác thực
        if not (request.user.is_staff or request.user.role == 'admin'):
            # Người dùng thường chỉ được cập nhật thông tin không liên quan đến trạng thái
            if 'is_verified' in request.data:
                return Response(
                    {"detail": "Bạn không có quyền thay đổi trạng thái xác thực"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        """API để admin xác thực danh tính người dùng"""
        identity = self.get_object()
        identity.is_verified = True
        identity.save()
        return Response({"status": "Đã xác thực thành công"})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """API để admin từ chối xác thực danh tính người dùng"""
        identity = self.get_object()
        identity.is_verified = False
        identity.rejection_reason = request.data.get('reason', '')
        identity.save()
        return Response({"status": "Đã từ chối xác thực"})
