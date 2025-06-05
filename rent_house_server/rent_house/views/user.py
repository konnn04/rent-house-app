from rest_framework import viewsets, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from rent_house.models import User, IdentityVerification
from rent_house.serializers import UserSerializer, IdentityVerificationSerializer

from rent_house.utils import upload_image_to_cloudinary
from rent_house.permissions import IsOwnerOrReadOnly

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    filterset_fields = ['role', 'is_active']

    def list(self, request, *args, **kwargs):
        search = request.query_params.get('search')
        if not search:
            return Response(
                {"error": "Tham số 'search' là bắt buộc."},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = self.get_queryset().filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(phone_number__icontains=search)
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
        user = request.user
        avatar = request.FILES.get('avatar')
        if not avatar:
            return Response({"error": "Avatar is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        avatar_url = upload_image_to_cloudinary(avatar)
        if not avatar_url:
            return Response({"error": "Failed to upload image"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        user.avatar = avatar_url
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class IdentityVerificationViewSet(viewsets.ModelViewSet):
    serializer_class = IdentityVerificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'admin':
            return IdentityVerification.objects.all()
        return IdentityVerification.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
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
        if not (request.user.is_staff or request.user.role == 'admin'):
            if 'is_verified' in request.data:
                return Response(
                    {"detail": "Bạn không có quyền thay đổi trạng thái xác thực"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        identity = self.get_object()
        identity.is_verified = True
        identity.save()
        return Response({"status": "Đã xác thực thành công"})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        identity = self.get_object()
        identity.is_verified = False
        identity.rejection_reason = request.data.get('reason', '')
        identity.save()
        return Response({"status": "Đã từ chối xác thực"})
