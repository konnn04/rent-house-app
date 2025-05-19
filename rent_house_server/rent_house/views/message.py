from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from rent_house.models import ChatGroup, ChatMembership, Message, User, Media
from rent_house.serializers import (
    MessageSerializer
)
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image
from rent_house.firebase_utils import send_chat_notification
from rent_house import serializers

class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý tin nhắn (Message)"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['created_at']
    
    def get_queryset(self):
        """Chỉ hiển thị tin nhắn của các chat mà user là thành viên"""
        queryset = Message.objects.filter(chat_group__members=self.request.user)
        
        # If chat_group_id is provided in URL params, filter by it
        chat_group_id = self.kwargs.get('chat_group_id')
        if chat_group_id:
            queryset = queryset.filter(chat_group_id=chat_group_id)
            
        return queryset
    
    def perform_create(self, serializer):
        """Gửi tin nhắn mới"""
        chat_id = self.request.data.get('chat_group')
        try:
            chat_group = ChatGroup.objects.get(id=chat_id)
            
            # Kiểm tra user có phải là thành viên không
            if not chat_group.members.filter(id=self.request.user.id).exists():
                return Response({"error": "Bạn không phải là thành viên của chat này"}, status=status.HTTP_403_FORBIDDEN)
            
            # Gửi tin nhắn
            message = serializer.save(sender=self.request.user)
            
            # Xử lý hình ảnh nếu có
            images = self.request.FILES.getlist('images')
            if images:
                for image in images:
                    image_url = upload_image_to_cloudinary(image, folder="message_images")
                    if image_url:
                        Media.objects.create(
                            content_type=ContentType.objects.get_for_model(Message),
                            object_id=message.id,
                            url=image_url,
                            media_type='image',
                            purpose='attachment',
                            public_id=image_url.split('/')[-1].split('.')[0]
                        )
            
            # Update thời gian cập nhật của chat
            chat_group.save(update_fields=['updated_at'])  # Tự động cập nhật updated_at
            
            # Gửi thông báo đến các thành viên khác
            recipients = chat_group.members.exclude(id=self.request.user.id)
            for recipient in recipients:
                send_chat_notification(
                    recipient=recipient,
                    sender=self.request.user,
                    chat_group=chat_group,
                    message_content=message.content,
                    message_id=message.id
                )
            
            return message
            
        except ChatGroup.DoesNotExist:
            raise serializers.ValidationError("Chat group không tồn tại")
    
    @action(detail=True, methods=['post'])
    def delete_message(self, request, pk=None):
        """Xóa tin nhắn (soft delete)"""
        message = self.get_object()
        
        # Chỉ người gửi mới được xóa tin nhắn của mình
        if message.sender != request.user:
            return Response({"error": "Không có quyền xóa tin nhắn này"}, status=status.HTTP_403_FORBIDDEN)
        
        # Soft delete
        message.soft_delete()
        
        return Response({"status": "success"})
