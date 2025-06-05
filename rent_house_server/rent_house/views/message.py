from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from rent_house.models import Message, ChatGroup, Media
from rent_house.serializers import MessageSerializer
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image
from rent_house.permissions import IsOwnerOrReadOnly

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    http_method_names = ['post', 'patch', 'delete'] 
    
    def get_queryset(self):
        return Message.objects.filter(
            chat_group__members=self.request.user,
            sender=self.request.user  
        )
    
    def create(self, request, *args, **kwargs):
        chat_id = request.data.get('chat_group')
        if not chat_id:
            return Response(
                {"error": "chat_group là bắt buộc"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            chat_group = ChatGroup.objects.get(id=chat_id)
            
            if not chat_group.members.filter(id=request.user.id).exists():
                return Response(
                    {"error": "Bạn không phải là thành viên của chat này"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            media_files = request.FILES.getlist('medias', [])
            has_media = len(media_files) > 0
            
            if not has_media and (not request.data.get('content') or not request.data.get('content').strip()):
                return Response({
                    "error": "Tin nhắn phải có nội dung hoặc ít nhất một tệp đính kèm"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            request_data = request.data.copy()
            if has_media and (not request_data.get('content') or not request_data.get('content').strip()):
                request_data['content'] = ""
            
            serializer = self.get_serializer(data=request_data)
            serializer.is_valid(raise_exception=True)
            
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
            
            response_data = serializer.data
            response_data['media'] = media_items
            
            headers = self.get_success_headers(serializer.data)
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
            
        except ChatGroup.DoesNotExist:
            return Response({"error": "Nhóm chat không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    def update(self, request, *args, **kwargs):
        message = self.get_object()
        
        if message.sender != request.user:
            return Response(
                {"error": "Bạn chỉ có thể cập nhật tin nhắn của mình"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if message.is_system_message:
            return Response(
                {"error": "Không thể cập nhật tin nhắn hệ thống"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if message.is_removed:
            return Response(
                {"error": "Tin nhắn này đã bị xóa"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if 'content' not in request.data:
            return Response(
                {"error": "Trường content là bắt buộc"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message.content = request.data['content']
        message.save(update_fields=['content', 'updated_at'])
        
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        
        if message.sender != request.user:
            return Response(
                {"error": "Bạn chỉ có thể xóa tin nhắn của mình"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if message.is_system_message:
            return Response(
                {"error": "Không thể xóa tin nhắn hệ thống"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message.soft_delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
