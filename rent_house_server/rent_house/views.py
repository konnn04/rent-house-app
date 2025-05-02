from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from rent_house.models import User, House, Room, Post, Comment, Interaction, Follow
from rent_house import serializers


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(detail=False, methods=['get', 'patch'], url_path='current-user', permission_classes = [permissions.IsAuthenticated])
    def current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name', 'phone_number']:
                    setattr(user, k, v)
                elif k.__eq__('password'):
                    user.set_password(v)
            user.save()
        serializer = serializers.UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = serializers.HouseSerializer
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        # house_type = self.request.query_params.get('house_type')
        # if house_type:
        #     queryset = queryset.filter(type=house_type)
        return queryset
    