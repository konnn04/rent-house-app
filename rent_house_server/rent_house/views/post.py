from rest_framework import viewsets, parsers, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.contenttypes.models import ContentType
from math import cos, radians

from rent_house.models import Post, Media, Interaction
from rent_house.serializers import PostSerializer, PostDetailSerializer
from rent_house.permissions import IsOwnerOrAdminOrReadOnly
from rent_house.utils import upload_image_to_cloudinary, delete_cloudinary_image

class PostViewSet(viewsets.ModelViewSet):
    """ViewSet for managing posts with pagination and filtering"""
    queryset = Post.objects.filter(is_active=True)
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdminOrReadOnly]
    pagination_class = PageNumberPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'address']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Lọc theo người dùng (username)
        author_username = self.request.query_params.get('author_username')
        if author_username:
            queryset = queryset.filter(author__username=author_username)

        # Lọc theo loại bài viết
        post_type = self.request.query_params.get('type')
        if post_type:
            queryset = queryset.filter(type=post_type)

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    def perform_create(self, serializer):
        # Create the post first without images
        post = serializer.save(author=self.request.user)
        
        # Process images if any are uploaded
        self.handle_images(post)
        
        return post
        
    def perform_update(self, serializer):
        # Update the post
        post = serializer.save()
        
        # Process images if any are uploaded
        self.handle_images(post)
        
        return post
    
    def handle_images(self, post):
        """Handle image uploads for posts"""
        # Check if images were uploaded
        images = self.request.FILES.getlist('images')
        
        # Process image files if present
        if images:
            for image in images:
                # Upload to Cloudinary
                image_url = upload_image_to_cloudinary(image, folder="post_images")
                if image_url:
                    # Create Media object
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Post),
                        object_id=post.id,
                        url=image_url,
                        media_type='image',
                        purpose='attachment',
                        public_id=image_url.split('/')[-1].split('.')[0]
                    )
        
        # Check for base64 encoded images in data
        base64_images = self.request.data.getlist('base64_images', [])
        if base64_images:
            for base64_image in base64_images:
                try:
                    # Upload to Cloudinary
                    image_url = upload_image_to_cloudinary(base64_image, folder="post_images")
                    if image_url:
                        # Create Media object
                        Media.objects.create(
                            content_type=ContentType.objects.get_for_model(Post),
                            object_id=post.id,
                            url=image_url,
                            media_type='image',
                            purpose='attachment',
                            public_id=image_url.split('/')[-1].split('.')[0]
                        )
                except Exception as e:
                    print(f"Error processing base64 image: {e}")
                    
    @action(detail=True, methods=['post'])
    def toggle_interaction(self, request, pk=None):
        """Toggle like/dislike on a post"""
        post = self.get_object()
        interaction_type = request.data.get('type', 'like')
        
        interaction, created = Interaction.objects.get_or_create(
            user=request.user,
            post=post,
            type=interaction_type,
            defaults={'is_interacted': True}
        )
        
        if not created:
            # Toggle the interaction
            interaction.is_interacted = not interaction.is_interacted
            interaction.save()
        
        return Response({
            'status': 'success',
            'is_interacted': interaction.is_interacted,
            'type': interaction_type
        })
    
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        """Add an image to an existing post"""
        post = self.get_object()
        
        # Check permissions (only author can add images)
        self.check_object_permissions(request, post)
        
        images = request.FILES.getlist('images')
        if not images:
            return Response({"error": "No images provided"}, status=400)
            
        media_items = []
        for image in images:
            # Upload to Cloudinary
            image_url = upload_image_to_cloudinary(image, folder="post_images")
            if image_url:
                # Create Media object
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
        """Remove an image from a post"""
        post = self.get_object()
        
        # Check permissions (only author can remove images)
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
            
            # Delete from Cloudinary
            if media.url and 'cloudinary' in media.url:
                delete_cloudinary_image(media.url)
                
            media.delete()
            return Response({"status": "success", "message": "Image removed"})
            
        except Media.DoesNotExist:
            return Response({"error": "Image not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """Get the current user's posts"""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
            
        posts = Post.objects.filter(author=request.user).order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(posts)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Filter posts by type"""
        post_type = request.query_params.get('type')
        if not post_type:
            return Response({"error": "type parameter is required"}, status=400)
            
        posts = Post.objects.filter(type=post_type, is_active=True).order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(posts)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Get posts near a location"""
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 5)  # Default 5km radius
        
        if not lat or not lng:
            return Response({"error": "lat and lng parameters are required"}, status=400)
            
        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
            
            # A simple approximation (not accurate for large distances)
            # For better accuracy, use a geographic database or PostGIS
            lat_range = radius / 111.0  # 1 degree latitude is approx 111km
            lng_range = radius / (111.0 * abs(cos(radians(lat))))
            
            posts = Post.objects.filter(
                is_active=True,
                latitude__range=(lat - lat_range, lat + lat_range),
                longitude__range=(lng - lng_range, lng + lng_range)
            ).order_by('-created_at')
            
            # Apply pagination
            page = self.paginate_queryset(posts)
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        except ValueError:
            return Response({"error": "Invalid lat, lng, or radius values"}, status=400)
    
