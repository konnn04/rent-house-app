from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from rent_house.models import Follow, User
from rent_house.serializers import FollowSerializer, UserSummarySerializer

class FollowViewSet(viewsets.GenericViewSet):
    """ViewSet cho quản lý theo dõi (Follow)"""
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'  # Sử dụng ID thay vì username
    
    def get_queryset(self):
        """Mặc định: Lấy danh sách người mình đang follow"""
        return Follow.objects.filter(follower=self.request.user, is_following=True)
    
    def list(self, request):
        """GET /api/follows/ - Lấy danh sách người mà user hiện tại đang follow"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """GET /api/follows/{id}/ - Kiểm tra trạng thái follow"""
        target_user = get_object_or_404(User, id=pk)
        
        is_following = Follow.objects.filter(
            follower=request.user,
            followee=target_user,
            is_following=True
        ).exists()
        
        return Response({
            "user_id": int(pk),
            "username": target_user.username,
            "is_following": is_following
        })
    
    def create(self, request):
        followee_id = request.data.get('followee')
        if not followee_id:
            return Response({"error": "Vui lòng cung cấp ID người dùng cần follow"}, 
                           status=status.HTTP_400_BAD_REQUEST)
            
        try:
            target_user = User.objects.get(id=followee_id)
        except User.DoesNotExist:
            return Response({"error": "Người dùng không tồn tại"}, 
                           status=status.HTTP_404_NOT_FOUND)
            
        # Xử lý follow - luôn set is_following=True
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            followee=target_user,
            defaults={'is_following': True}
        )
        
        if not created and not follow.is_following:
            follow.is_following = True
            follow.save(update_fields=['is_following', 'updated_at'])
        
        if created and follow.is_following:
            try:
                from rent_house.services.notification_service import follow_notification
                follow_notification(request.user, target_user)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Lỗi khi gửi thông báo có người theo dõi: {str(e)}")
        

        return Response({
            "status": "success",
            "is_following": True,
            "user_id": target_user.id,
            "username": target_user.username
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        target_user = get_object_or_404(User, id=pk)
        is_following = request.data.get('is_following', True)
        
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            followee=target_user,
            defaults={'is_following': is_following}
        )
        
        if not created and follow.is_following != is_following:
            follow.is_following = is_following
            follow.save(update_fields=['is_following', 'updated_at'])
        
        return Response({
            "status": "success",
            "is_following": follow.is_following,
            "user_id": target_user.id,
            "username": target_user.username
        })
    
    @action(detail=True, methods=['post'])
    def unfollow(self, request, pk=None):
        """POST /api/follows/{id}/unfollow/ - Unfollow một user cụ thể"""
        target_user = get_object_or_404(User, id=pk)
        
        # Xử lý unfollow - luôn set is_following=False
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            followee=target_user,
            defaults={'is_following': False}
        )
        
        if not created and follow.is_following:
            follow.is_following = False
            follow.save(update_fields=['is_following', 'updated_at'])
        
        return Response({
            "status": "success",
            "is_following": False,
            "user_id": target_user.id,
            "username": target_user.username
        })
    
    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        """GET /api/follows/{id}/followers/ - Lấy danh sách người theo dõi user"""
        target_user = get_object_or_404(User, id=pk)
        
        followers = User.objects.filter(
            following__followee=target_user, 
            following__is_following=True
        )
        
        page = self.paginate_queryset(followers)
        if page is not None:
            serializer = UserSummarySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = UserSummarySerializer(followers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        """GET /api/follows/{id}/following/ - Lấy danh sách người user đang theo dõi"""
        target_user = get_object_or_404(User, id=pk)
        
        following = User.objects.filter(
            followers__follower=target_user, 
            followers__is_following=True
        )
        
        page = self.paginate_queryset(following)
        if page is not None:
            serializer = UserSummarySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = UserSummarySerializer(following, many=True)
        return Response(serializer.data)