from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from rent_house.models import User
from rent_house.serializers.profile import ProfileSerializer, DetailedProfileSerializer, PublicProfileSerializer

class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet cho hiển thị thông tin profile người dùng"""
    queryset = User.objects.all()
    serializer_class = PublicProfileSerializer
    lookup_field = 'username' 
    # Bắt đăng nhập để xem thông tin profile
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, username=None):
        """Lấy thông tin profile của người dùng bằng username"""
        user = get_object_or_404(User, username=username)
        
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
    
