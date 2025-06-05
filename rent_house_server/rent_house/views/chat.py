from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from rent_house.models import ChatGroup, ChatMembership, Message, User, Media
from rent_house.serializers import (
    ChatGroupSerializer, ChatGroupDetailSerializer, 
    ChatGroupUpdateSerializer, MessageSerializer, UserSummarySerializer
)
from rent_house.utils import upload_image_to_cloudinary
from rent_house.permissions import IsOwnerOrReadOnly

class ChatGroupViewSet(viewsets.ModelViewSet):
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
        return ChatGroup.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        chat_group = serializer.save(created_by=self.request.user)
        
        ChatMembership.objects.create(
            chat_group=chat_group,
            user=self.request.user,
            is_admin=True
        )
        
        member_ids = self.request.data.getlist('members', [])
        for member_id in member_ids:
            try:
                user = User.objects.get(id=member_id)
                if user != self.request.user:  
                    ChatMembership.objects.create(
                        chat_group=chat_group,
                        user=user,
                        is_admin=False
                    )
            except User.DoesNotExist:
                pass
                
        return chat_group
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
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
        instance = self.get_object()
        
        if not instance.is_group:
            return Response(
                {"error": "Không thể xóa chat trực tiếp, hãy sử dụng leave_group thay thế"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        chat_group = self.get_object()
        
        messages = Message.objects.filter(chat_group=chat_group).order_by('-created_at')
        
        membership = ChatMembership.objects.filter(
            chat_group=chat_group,
            user=request.user
        ).first()
        
        if membership:
            membership.mark_as_read()
        
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='send-message')
    def send_message(self, request, pk=None):
        chat_group = self.get_object()
        
        if not chat_group.members.filter(id=request.user.id).exists():
            return Response(
                {"error": "Bạn không phải là thành viên của nhóm chat này"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        media_files = request.FILES.getlist('medias', [])
        has_media = len(media_files) > 0
        
        if not has_media and (not request.data.get('content') or not request.data.get('content').strip()):
            return Response({
                "error": "Tin nhắn phải có nội dung hoặc ít nhất một media"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        request_data = request.data.copy()
        
        if has_media and (not request_data.get('content') or not request_data.get('content').strip()):
            request_data['content'] = ""
        
        request_data['chat_group'] = chat_group.id
        
        serializer = MessageSerializer(data=request_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        message = serializer.save(sender=request.user)
        
        media_items = []
        
        if media_files:
            for media_file in media_files:
                media_type = 'image'
                content_type = getattr(media_file, 'content_type', '') or getattr(media_file, 'type', '')
                
                if content_type and 'video' in content_type:
                    media_type = 'video'
                    folder = "message_videos"
                else:
                    folder = "message_images"
                
                media_url = upload_image_to_cloudinary(media_file, folder=folder)
                
                if media_url:
                    media = Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Message),
                        object_id=message.id,
                        url=media_url,
                        media_type=media_type,
                        purpose='attachment',
                        public_id=media_url.split('/')[-1].split('.')[0]
                    )
                    
                    media_items.append({
                        'id': media.id,
                        'url': media.url,
                        'thumbnail': media.get_url('thumbnail') if media_type == 'image' else None,
                        'media_type': media_type
                    })
        
        chat_group.save(update_fields=['updated_at'])
        
        membership = ChatMembership.objects.filter(
            chat_group=chat_group,
            user=request.user
        ).first()
        
        if membership:
            membership.mark_as_read()
        
        response_data = serializer.data
        response_data['media'] = media_items
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def create_direct_chat(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "Thiếu user_id"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            other_user = User.objects.get(id=user_id)
            
            chat_group = ChatGroup.get_or_create_direct_chat(request.user, other_user)
            
            serializer = self.get_serializer(chat_group)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response({"error": "User không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def leave_group(self, request, pk=None):
        chat_group = self.get_object()
        
        if not chat_group.is_group:
            return Response({"error": "Không thể rời khỏi chat trực tiếp"}, status=status.HTTP_400_BAD_REQUEST)
            
        chat_group.remove_member(request.user)
        
        Message.objects.create(
            chat_group=chat_group,
            sender=request.user,
            content=f"{request.user.username} đã rời khỏi nhóm chat.",
            is_system_message=True
        )
        
        return Response({"status": "success"})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        memberships = ChatMembership.objects.filter(user=request.user)
        
        total_unread = 0
        chats_with_unread = []
        
        for membership in memberships:
            unread_count = membership.get_unread_count()
            
            if unread_count > 0:
                chat_group = membership.chat_group
                chat_info = {
                    'chat_id': chat_group.id,
                    'name': chat_group.name if chat_group.is_group else None,
                    'is_group': chat_group.is_group,
                    'unread_count': unread_count,
                    'members_summary': UserSummarySerializer(
                        chat_group.members.exclude(id=request.user.id)[:3], 
                        many=True
                    ).data
                }
                
                last_message = chat_group.messages.order_by('-created_at').first()
                if last_message:
                    chat_info['last_message'] = {
                        'id': last_message.id,
                        'sender': UserSummarySerializer(last_message.sender).data,
                        'content': last_message.get_formatted_content()[:100],
                        'created_at': last_message.created_at
                    }
                
                chats_with_unread.append(chat_info)
                total_unread += unread_count
        
        return Response({
            'total_unread': total_unread,
            'chats_with_unread': chats_with_unread
        })


