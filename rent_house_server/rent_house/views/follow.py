from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from rent_house.models import Follow, User
from rent_house.serializers import FollowSerializer, UserSummarySerializer

class FollowViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý theo dõi (Follow)"""
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter follow relationship theo tham số"""
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Follow.objects.filter(follower_id=user_id, is_following=True)
        return Follow.objects.filter(follower=self.request.user)
    
    def perform_create(self, serializer):
        """Tạo mới follow hoặc update follow hiện có"""
        followee_id = self.request.data.get('followee')
        
        try:
            followee = User.objects.get(id=followee_id)
            
            # Kiểm tra xem đã follow chưa
            follow, created = Follow.objects.get_or_create(
                follower=self.request.user,
                followee=followee,
                defaults={'is_following': True}
            )
            
            if not created:
                # Nếu đã follow từ trước, update trạng thái
                follow.is_following = True
                follow.save(update_fields=['is_following'])
                
            return follow
            
        except User.DoesNotExist:
            raise serializers.ValidationError("User không tồn tại")
    
    @action(detail=True, methods=['post'])
    def unfollow(self, request, pk=None):
        """Unfollow một user"""
        follow = self.get_object()
        
        if follow.follower != request.user:
            return Response({"error": "Không có quyền unfollow"}, status=status.HTTP_403_FORBIDDEN)
            
        # Thay vì xóa, chỉ đánh dấu không theo dõi nữa
        follow.is_following = False
        follow.save(update_fields=['is_following'])
        
        return Response({"status": "success"})
    
    @action(detail=False, methods=['get'])
    def followers(self, request):
        """Lấy danh sách người theo dõi bạn"""
        followers = User.objects.filter(following__followee=request.user, following__is_following=True)
        serializer = UserSummarySerializer(followers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def following(self, request):
        """Lấy danh sách người bạn đang theo dõi"""
        following = User.objects.filter(followers__follower=request.user, followers__is_following=True)
        serializer = UserSummarySerializer(following, many=True)
        return Response(serializer.data)
