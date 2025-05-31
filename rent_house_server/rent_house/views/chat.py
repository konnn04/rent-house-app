from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from rent_house.models import ChatGroup, ChatMembership, Message, User, Media
from rent_house.serializers import (
    ChatGroupSerializer, ChatGroupDetailSerializer, 
    ChatGroupUpdateSerializer, MessageSerializer
)
from rent_house.utils import upload_image_to_cloudinary
from rent_house.firebase_utils import send_chat_notification
from rent_house.permissions import IsOwnerOrReadOnly

class ChatGroupViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý nhóm chat (ChatGroup)"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChatGroupDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return ChatGroupUpdateSerializer
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
    
    def update(self, request, *args, **kwargs):
        """Cập nhật thông tin nhóm chat"""
        instance = self.get_object()
        
        # Kiểm tra xem user có phải là thành viên và có quyền admin (đối với nhóm chat)
        membership = instance.chat_memberships.filter(user=request.user).first()
        if not membership:
            return Response(
                {"error": "Bạn không phải là thành viên của nhóm chat này"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if instance.is_group and not membership.is_admin:
            return Response(
                {"error": "Chỉ có admin mới có thể cập nhật cài đặt nhóm"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Xóa nhóm chat"""
        instance = self.get_object()
        
        # Không thể xóa chat trực tiếp, chỉ có thể rời khỏi
        if not instance.is_group:
            return Response(
                {"error": "Không thể xóa chat trực tiếp, hãy sử dụng leave_group thay thế"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Chỉ người tạo hoặc admin mới có thể xóa nhóm
        membership = instance.chat_memberships.filter(user=request.user).first()
        if not membership or not membership.is_admin or instance.created_by != request.user:
            return Response(
                {"error": "Chỉ người tạo nhóm mới có thể xóa nhóm"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'], url_path='messages')
    def messages(self, request, pk=None):
        """Lấy danh sách tin nhắn của một nhóm chat (có phân trang)"""
        chat_group = self.get_object()
        
        # Lọc tin nhắn của nhóm chat
        messages = Message.objects.filter(chat_group=chat_group).order_by('-created_at')
        
        # Cập nhật trạng thái đã đọc
        membership = ChatMembership.objects.filter(
            chat_group=chat_group,
            user=request.user
        ).first()
        
        if membership:
            membership.mark_as_read()
        
        # Phân trang
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        # Trường hợp không phân trang
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='send-message')
    def send_message(self, request, pk=None):
        """Gửi tin nhắn mới đến nhóm chat"""
        chat_group = self.get_object()
        
        if not chat_group.members.filter(id=request.user.id).exists():
            return Response(
                {"error": "Bạn không phải là thành viên của nhóm chat này"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Kiểm tra xem request có media không
        media_files = request.FILES.getlist('medias', [])
        has_media = len(media_files) > 0
        
        # Nếu không có cả nội dung và media, trả về lỗi
        if not has_media and (not request.data.get('content') or not request.data.get('content').strip()):
            return Response({
                "error": "Tin nhắn phải có nội dung hoặc ít nhất một media"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Tạo bản sao của dữ liệu request để có thể sửa đổi
        request_data = request.data.copy()
        
        # Nếu không có content nhưng có media, thêm content rỗng
        if has_media and (not request_data.get('content') or not request_data.get('content').strip()):
            request_data['content'] = ""
        
        # Thêm chat_group vào dữ liệu trước khi validate
        request_data['chat_group'] = chat_group.id
        
        # Tạo tin nhắn mới với dữ liệu đã điều chỉnh
        serializer = MessageSerializer(data=request_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # Lưu tin nhắn
        message = serializer.save(sender=request.user)
        
        media_items = []
        
        # Xử lý các tệp media
        if media_files:
            for media_file in media_files:
                media_type = 'image'
                content_type = getattr(media_file, 'content_type', '') or getattr(media_file, 'type', '')
                
                if content_type and 'video' in content_type:
                    media_type = 'video'
                    folder = "message_videos"
                else:
                    folder = "message_images"
                
                # Upload lên Cloudinary
                media_url = upload_image_to_cloudinary(media_file, folder=folder)
                
                if media_url:
                    # Tạo đối tượng Media và thêm vào response
                    media = Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Message),
                        object_id=message.id,
                        url=media_url,
                        media_type=media_type,
                        purpose='attachment',
                        public_id=media_url.split('/')[-1].split('.')[0]
                    )
                    
                    # Thêm thông tin vào danh sách response
                    media_items.append({
                        'id': media.id,
                        'url': media.url,
                        'thumbnail': media.get_url('thumbnail') if media_type == 'image' else None,
                        'media_type': media_type
                    })
        
        # Cập nhật thời gian cập nhật của nhóm chat
        chat_group.save(update_fields=['updated_at'])
        
        # Gửi thông báo đến các thành viên khác trong nhóm
        recipients = chat_group.members.exclude(id=request.user.id)
        content_preview = message.content if message.content else "Đã gửi media"
        
        for recipient in recipients:
            send_chat_notification(
                recipient=recipient,
                sender=request.user,
                chat_group=chat_group,
                message_content=content_preview,
                message_id=message.id
            )
        
        # Cập nhật response với thông tin media
        response_data = serializer.data
        response_data['media'] = media_items
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
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


