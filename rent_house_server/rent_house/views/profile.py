from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from rent_house.models import User
from rent_house.serializers.profile import ProfileSerializer, DetailedProfileSerializer, PublicProfileSerializer

class ProfileViewSet(viewsets.ViewSet):
    """ViewSet cho quản lý profile của người dùng"""
    queryset = User.objects.all()
    lookup_field = 'username'  # Thay đổi lookup field thành username
    
    def get_permissions(self):
        """
        Thiết lập quyền truy cập:
        - Xem profile của người khác không cần đăng nhập
        - Xem profile chi tiết của mình hoặc chỉnh sửa profile cần đăng nhập
        """
        if self.action in ['me', 'update_profile']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Lấy thông tin chi tiết profile của người dùng hiện tại"""
        if not request.user.is_authenticated:
            return Response({"error": "Bạn cần đăng nhập"}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = DetailedProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], url_path='update')
    def update_profile(self, request):
        """Cập nhật thông tin profile của người dùng hiện tại"""
        if not request.user.is_authenticated:
            return Response({"error": "Bạn cần đăng nhập"}, status=status.HTTP_401_UNAUTHORIZED)
            
        user = request.user
        serializer = DetailedProfileSerializer(user, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, username=None):
        """Lấy thông tin profile của một người dùng khác bằng username"""
        user = get_object_or_404(User, username=username)
        
        # Nếu đang xem profile của chính mình
        if request.user.is_authenticated and request.user.id == user.id:
            serializer = DetailedProfileSerializer(user, context={'request': request})
        else:
            serializer = PublicProfileSerializer(user, context={'request': request})
            
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def owners(self, request):
        """Lấy danh sách các chủ sở hữu"""
        owners = User.objects.filter(role='owner', is_active=True)
        page = self.paginate_queryset(owners)
        
        if page is not None:
            serializer = ProfileSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = ProfileSerializer(owners, many=True, context={'request': request})
        return Response(serializer.data)