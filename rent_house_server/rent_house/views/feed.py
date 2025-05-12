from rest_framework import viewsets, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from rent_house.models import User, Post
from rent_house.serializers import UserSerializer, PostSerializer

class NewFeedViewSet(viewsets.ViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]
    pagination_class = PageNumberPagination  # Use default pagination

    # , permission_classes=[permissions.IsAuthenticated]
    @action(detail=False, methods=['get'], url_path='new-feed')
    def new_feed(self, request):
        user = request.user
        posts = Post.objects.filter(is_active=True).order_by('-created_at')
        
        # Apply pagination
        paginator = self.pagination_class()
        paginated_posts = paginator.paginate_queryset(posts, request)
        
        # Serialize the paginated results
        serializer = PostSerializer(paginated_posts, many=True, context={'request': request})
        
        # Return paginated response
        return paginator.get_paginated_response(serializer.data)
