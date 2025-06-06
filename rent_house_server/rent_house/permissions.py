from rest_framework import permissions
from rent_house.models import Role

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True
            
        if request.user.role in [Role.ADMIN.value[0], Role.MODERATOR.value[0]]:
            return True
            
        if hasattr(obj, 'author'):
            return obj.author == request.user
            
        return False

class IsOwnerOrModderOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True
            
        if request.user.role in [Role.ADMIN.value[0], Role.MODERATOR.value[0], Role.COLLABORTOR.value[0]]:
            return True
            
        if hasattr(obj, 'author'):
            return obj.author == request.user
            
        return False

class IsOwnerOfHouseOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            return False
            
        if request.user.role != Role.OWNER.value[0]:
            return False
            
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
            
        return False

class IsOwnerRoleOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated and request.user.role == Role.OWNER.value[0]
