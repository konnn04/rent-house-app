from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from rent_house.models import ChatGroup, ChatMembership, Message, User, Media
from rent_house.serializers import (
    ChatGroupSerializer, ChatGroupDetailSerializer, 
    ChatMembershipSerializer, MessageSerializer
)
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image
from rent_house.firebase_utils import send_chat_notification

class ChatGroupViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý nhóm chat (ChatGroup)"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChatGroupDetailSerializer
        return ChatGroupSerializer
    
    def get_queryset(self):
        """Chỉ hiển thị các nhóm chat mà user là thành viên"""
        return ChatGroup.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        """Tạo nhóm chat mới"""
        chat_group = serializer.save(created_by=self.request.user)
        
        # Thêm người tạo làm admin
        ChatMembership.objects.create(
            chat_group=chat_group,
            user=self.request.user,
            is_admin=True
        )
        
        # Thêm các thành viên khác từ request
        member_ids = self.request.data.getlist('members', [])
        for member_id in member_ids:
            try:
                user = User.objects.get(id=member_id)
                if user != self.request.user:  # Không thêm chính mình lần nữa
                    ChatMembership.objects.create(
                        chat_group=chat_group,
                        user=user,
                        is_admin=False
                    )
            except User.DoesNotExist:
                pass
                
        return chat_group
    
    @action(detail=False, methods=['post'])
    def create_direct_chat(self, request):
        """Tạo hoặc lấy chat 1-1 với một user"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "Thiếu user_id"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            other_user = User.objects.get(id=user_id)
            
            # Lấy hoặc tạo chat trực tiếp
            chat_group = ChatGroup.get_or_create_direct_chat(request.user, other_user)
            
            # Trả về thông tin chat
            serializer = self.get_serializer(chat_group)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response({"error": "User không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Thêm thành viên vào nhóm chat"""
        chat_group = self.get_object()
        
        # Chỉ admin mới có quyền thêm thành viên
        membership = chat_group.chat_memberships.filter(user=request.user).first()
        if not membership or not membership.is_admin:
            return Response({"error": "Không có quyền thêm thành viên"}, status=status.HTTP_403_FORBIDDEN)
            
        user_id = request.data.get('user_id')
        is_admin = request.data.get('is_admin', False)
        
        try:
            user = User.objects.get(id=user_id)
            
            # Kiểm tra user đã là thành viên chưa
            if chat_group.members.filter(id=user.id).exists():
                return Response({"error": "User đã là thành viên"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Thêm thành viên mới
            chat_group.add_member(user, is_admin=is_admin)
            
            # Tạo thông báo hệ thống trong chat
            Message.objects.create(
                chat_group=chat_group,
                sender=request.user,
                content=f"{user.username} đã được thêm vào nhóm chat.",
                is_system_message=True
            )
            
            return Response({"status": "success"})
            
        except User.DoesNotExist:
            return Response({"error": "User không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Xóa thành viên khỏi nhóm chat"""
        chat_group = self.get_object()
        
        # Chỉ admin mới có quyền xóa thành viên
        membership = chat_group.chat_memberships.filter(user=request.user).first()
        if not membership or not membership.is_admin:
            return Response({"error": "Không có quyền xóa thành viên"}, status=status.HTTP_403_FORBIDDEN)
            
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            
            # Kiểm tra user có phải là thành viên không
            if not chat_group.members.filter(id=user.id).exists():
                return Response({"error": "User không phải là thành viên"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Xóa thành viên
            chat_group.remove_member(user)
            
            # Tạo thông báo hệ thống trong chat
            Message.objects.create(
                chat_group=chat_group,
                sender=request.user,
                content=f"{user.username} đã bị xóa khỏi nhóm chat.",
                is_system_message=True
            )
            
            return Response({"status": "success"})
            
        except User.DoesNotExist:
            return Response({"error": "User không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def leave_group(self, request, pk=None):
        """Rời khỏi nhóm chat"""
        chat_group = self.get_object()
        
        # Không thể rời khỏi chat 1-1
        if not chat_group.is_group:
            return Response({"error": "Không thể rời khỏi chat trực tiếp"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Xóa thành viên
        chat_group.remove_member(request.user)
        
        # Tạo thông báo hệ thống trong chat
        Message.objects.create(
            chat_group=chat_group,
            sender=request.user,
            content=f"{request.user.username} đã rời khỏi nhóm chat.",
            is_system_message=True
        )
        
        return Response({"status": "success"})

class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý tin nhắn (Message)"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['created_at']
    
    def get_queryset(self):
        """Chỉ hiển thị tin nhắn của các chat mà user là thành viên"""
        chat_id = self.request.query_params.get('chat_id')
        queryset = Message.objects.filter(chat_group__members=self.request.user)
        
        if chat_id:
            queryset = queryset.filter(chat_group_id=chat_id)
            
            # Cập nhật thời gian đọc tin nhắn
            membership = ChatMembership.objects.filter(
                chat_group_id=chat_id,
                user=self.request.user
            ).first()
            
            if membership:
                membership.mark_as_read()
        
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
