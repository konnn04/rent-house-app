from rest_framework import viewsets, parsers, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.contenttypes.models import ContentType
from math import cos, radians
from django.db import transaction
from django.db.models import Q

from rent_house.models import Post, Media, Interaction
from rent_house.serializers import PostSerializer, PostDetailSerializer
from rent_house.permissions import IsOwnerOrAdminOrReadOnly, IsOwnerOrModderOrReadOnly
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_active=True)
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = PageNumberPagination
    filter_backends = [filters.OrderingFilter]  
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['destroy']:
            permission_classes = [IsOwnerOrModderOrReadOnly]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsOwnerOrAdminOrReadOnly]
        elif self.action == 'interact':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_active=True)

        author_username = self.request.query_params.get('author_username')
        if author_username:
            queryset = queryset.filter(author__username=author_username)

        post_type = self.request.query_params.get('type')
        if post_type:
            queryset = queryset.filter(type=post_type)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(address__icontains=search) |
                Q(author__username__icontains=search) |
                Q(author__address__icontains=search)
            )

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    @transaction.atomic
    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user, is_active=True)
        
        self.handle_images(post)

        try:
            from rent_house.services.notification_service import post_for_followers_notification
            post_for_followers_notification(self.request.user, post)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Lỗi khi tạo thông báo có bài mới: {str(e)}")
        
        return post
        
    
    @transaction.atomic
    def perform_update(self, serializer):
        post = serializer.save()
        self.handle_images(post)
        return post
    
    def handle_images(self, post):
        images = self.request.FILES.getlist('images') or self.request.FILES.getlist('images[]')
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Processing {len(images)} images for post {post.id}")
        logger.info(f"Available files: {list(self.request.FILES.keys())}")

        if images:
            for image in images:
                logger.info(f"Uploading image: {image.name}, size: {image.size} bytes")
                image_url = upload_image_to_cloudinary(image, folder="post_images")
                if image_url:
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Post),
                        object_id=post.id,
                        url=image_url,
                        media_type='image',
                        purpose='attachment',
                        public_id=image_url.split('/')[-1].split('.')[0]
                    )
                    logger.info(f"Successfully created media for image: {image_url}")
                else:
                    logger.error(f"Failed to upload image to Cloudinary: {image.name}")
                    
    @action(detail=True, methods=['post'])
    def interact(self, request, pk=None):
        try:
            interaction_type = request.data.get('type')
            
            if interaction_type not in ['like', 'dislike', 'none']:
                return Response({
                    'status': 'error',
                    'message': 'Loại tương tác không hợp lệ. Chỉ hỗ trợ "like", "dislike" hoặc "none".'
                }, status=400)
            
            post = self.get_object()
            
            interaction, created = Interaction.objects.get_or_create(
                user=request.user,
                post=post,
                defaults={'type': interaction_type}
            )
            
            if not created:
                if interaction.type == interaction_type:    
                    interaction.type = 'none'
                else:
                    interaction.type = interaction_type
                interaction.save()
            
            if created and interaction.type != 'none':
                try:
                    from rent_house.services.notification_service import interaction_notification
                    interaction_notification(request.user, post)
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Lỗi khi gửi thông báo có tương tác: {str(e)}")
            

            return Response({
                'like_count': post.get_interaction_count('like'),
                'status': 'success',
                'type': interaction.type,
                'post_id': post.id,
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=500)
    
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        post = self.get_object()
        
        self.check_object_permissions(request, post)
        
        images = request.FILES.getlist('images')
        if not images:
            return Response({"error": "No images provided"}, status=400)
            
        media_items = []
        for image in images:
            image_url = upload_image_to_cloudinary(image, folder="post_images")
            if image_url:
                media = Media.objects.create(
                    content_type=ContentType.objects.get_for_model(Post),
                    object_id=post.id,
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
        post = self.get_object()
        
        self.check_object_permissions(request, post)
        
        media_id = request.data.get('media_id')
        if not media_id:
            return Response({"error": "media_id is required"}, status=400)
            
        try:
            media = Media.objects.get(
                id=media_id,
                content_type=ContentType.objects.get_for_model(Post),
                object_id=post.id
            )
            
            if media.url and 'cloudinary' in media.url:
                delete_cloudinary_image(media.url)
                
            media.delete()
            return Response({"status": "success", "message": "Image removed"})
            
        except Media.DoesNotExist:
            return Response({"error": "Image not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
            
        posts = Post.objects.filter(author=request.user).order_by('-created_at')
        
        page = self.paginate_queryset(posts)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        post_type = request.query_params.get('type')
        if not post_type:
            return Response({"error": "type parameter is required"}, status=400)
            
        posts = Post.objects.filter(type=post_type, is_active=True).order_by('-created_at')
        
        page = self.paginate_queryset(posts)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 5) 
        
        if not lat or not lng:
            return Response({"error": "lat and lng parameters are required"}, status=400)
            
        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
            
            lat_range = radius / 111.0  
            lng_range = radius / (111.0 * abs(cos(radians(lat))))
            
            posts = Post.objects.filter(
                is_active=True,
                latitude__range=(lat - lat_range, lat + lat_range),
                longitude__range=(lng - lng_range, lng + lng_range)
            ).order_by('-created_at')
            
            page = self.paginate_queryset(posts)
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        except ValueError:
            return Response({"error": "Invalid lat, lng, or radius values"}, status=400)
