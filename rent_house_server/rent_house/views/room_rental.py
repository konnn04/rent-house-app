from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from rent_house.models import RoomRental, Room, House
from rent_house.serializers import RoomRentalSerializer
from rent_house.permissions import IsOwnerOfHouseOrReadOnly

class RoomRentalViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý thuê phòng (RoomRental)"""
    serializer_class = RoomRentalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter room rentals theo tham số"""
        user = self.request.user
        
        # Chủ nhà xem được tất cả các hợp đồng của nhà mình
        if user.role == 'owner':
            room_ids = Room.objects.filter(house__owner=user).values_list('id', flat=True)
            return RoomRental.objects.filter(room_id__in=room_ids)
        
        # Người thuê chỉ xem được hợp đồng của mình
        return RoomRental.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Tạo mới hợp đồng thuê phòng"""
        room_id = self.request.data.get('room')
        try:
            room = Room.objects.get(id=room_id)
            
            # Validate room availability
            if not room.is_available():
                return Response({"error": "Phòng đã đầy"}, status=status.HTTP_400_BAD_REQUEST)
            
            rental = serializer.save(user=self.request.user)
            
            # Update room occupancy
            room.cur_people += 1
            room.save(update_fields=['cur_people'])
            
            return rental
            
        except Room.DoesNotExist:
            raise serializers.ValidationError("Phòng không tồn tại")
    
    @action(detail=True, methods=['post'])
    def end_rental(self, request, pk=None):
        """Kết thúc hợp đồng thuê phòng"""
        rental = self.get_object()
        
        # Người thuê hoặc chủ nhà có thể kết thúc
        room_owner = rental.room.house.owner
        if request.user != rental.user and request.user != room_owner:
            return Response({"error": "Không có quyền kết thúc hợp đồng"}, status=status.HTTP_403_FORBIDDEN)
            
        # Set end date and inactive
        rental.end_date = timezone.now().date()
        rental.is_active = False
        rental.save(update_fields=['end_date', 'is_active'])
        
        # Update room occupancy
        room = rental.room
        if room.cur_people > 0:
            room.cur_people -= 1
            room.save(update_fields=['cur_people'])
        
        return Response({"status": "success"})
