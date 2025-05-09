from rest_framework import viewsets, serializers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType

from rent_house.models import Comment, Post, Media
from rent_house.serializers import CommentSerializer
from rent_house.permissions import IsOwnerOrAdminOrReadOnly
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image
from .pagination import SmallPagePagination

class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing comments with pagination"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdminOrReadOnly]
    pagination_class = SmallPagePagination
    
    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        parent_id = self.request.data.get('parent')
        
        try:
            post = Post.objects.get(id=post_id)
            parent = None
            
            if parent_id:
                parent = Comment.objects.get(id=parent_id, post=post)
                
            comment = serializer.save(
                author=self.request.user, 
                post=post,
                parent=parent
            )
            
            # Process images if any
            self.handle_images(comment)
            
            return comment
        except Post.DoesNotExist:
            raise serializers.ValidationError({"post": "Post does not exist"})
        except Comment.DoesNotExist:
            raise serializers.ValidationError({"parent": "Parent comment does not exist"})
    
    def perform_update(self, serializer):
        comment = serializer.save()
        # Process images if any
        self.handle_images(comment)
        return comment
    
    def handle_images(self, comment):
        """Handle image uploads for comments"""
        # Check if images were uploaded
        images = self.request.FILES.getlist('images')
        
        # Process image files if present
        if images:
            for image in images:
                # Upload to Cloudinary
                image_url = upload_image_to_cloudinary(image, folder="comment_images")
                if image_url:
                    # Create Media object
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Comment),
                        object_id=comment.id,
                        url=image_url,
                        media_type='image',
                        purpose='attachment',
                        public_id=image_url.split('/')[-1].split('.')[0]
                    )
    
    @action(detail=False, methods=['get'])
    def post_comments(self, request):
        """Get comments for a specific post with pagination"""
        post_id = request.query_params.get('post_id')
        parent_id = request.query_params.get('parent_id')
        
        if not post_id:
            return Response({"error": "post_id is required"}, status=400)
        
        if parent_id:
            # Get replies to a specific comment
            comments = Comment.objects.filter(post_id=post_id, parent_id=parent_id)
        else:
            # Get top-level comments
            comments = Comment.objects.filter(post_id=post_id, parent=None)
        
        # Order by newest first
        comments = comments.order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(comments)
        serializer = self.get_serializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        """Add an image to an existing comment"""
        comment = self.get_object()
        
        # Check permissions (only author can add images)
        self.check_object_permissions(request, comment)
        
        images = request.FILES.getlist('images')
        if not images:
            return Response({"error": "No images provided"}, status=400)
            
        media_items = []
        for image in images:
            # Upload to Cloudinary
            image_url = upload_image_to_cloudinary(image, folder="comment_images")
            if image_url:
                # Create Media object
                media = Media.objects.create(
                    content_type=ContentType.objects.get_for_model(Comment),
                    object_id=comment.id,
                    url=image_url,
                    media_type='image',
                    purpose='attachment',
                    public_id=image_url.split('/')[-1].split('.')[0]
                )
                media_items.append({
                    'id': media.id,
                    'url': media.url,
                    'thumbnail': media.get_url('thumbnail')
                })
        
        return Response({
            'status': 'success',
            'message': f'Added {len(media_items)} images',
            'media': media_items
        })
    
    @action(detail=True, methods=['delete'])
    def remove_image(self, request, pk=None):
        """Remove an image from a comment"""
        comment = self.get_object()
        
        # Check permissions (only author can remove images)
        self.check_object_permissions(request, comment)
        
        media_id = request.data.get('media_id')
        if not media_id:
            return Response({"error": "media_id is required"}, status=400)
            
        try:
            media = Media.objects.get(
                id=media_id,
                content_type=ContentType.objects.get_for_model(Comment),
                object_id=comment.id
            )
            
            # Delete from Cloudinary
            if media.url and 'cloudinary' in media.url:
                delete_cloudinary_image(media.url)
                
            media.delete()
            return Response({"status": "success", "message": "Image removed"})
            
        except Media.DoesNotExist:
            return Response({"error": "Image not found"}, status=404)
