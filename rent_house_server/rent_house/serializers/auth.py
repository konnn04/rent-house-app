from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction

from rent_house.models import User, VerificationCode

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 
                 'last_name', 'phone_number', 'role')
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """
        Kiểm tra email đã tồn tại chưa
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được đăng ký.")
        return value
    
    def validate_username(self, value):
        """
        Kiểm tra username đã tồn tại chưa
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên đăng nhập đã được sử dụng.")
        return value
    
    def validate(self, attrs):
        """
        Kiểm tra mật khẩu khớp nhau không
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
        
        # Kiểm tra mật khẩu có đủ mạnh không
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e)})
            
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        # Xóa trường password2 không dùng
        validated_data.pop('password2')
        
        # Tạo user nhưng chưa active
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', 'renter'),
            is_active=False  # Chưa kích hoạt cho đến khi xác minh email
        )
        
        # Đặt mật khẩu
        user.set_password(validated_data['password'])
        user.save()
        
        # Tạo mã xác thực
        VerificationCode.generate_code(user)
        
        return user

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """
        Kiểm tra mã xác thực có hợp lệ không
        """
        email = attrs.get('email')
        code = attrs.get('code')
        
        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email không hợp lệ hoặc đã được xác thực")
        
        # Lấy mã xác thực mới nhất và chưa sử dụng
        verification = VerificationCode.objects.filter(
            user=user,
            is_used=False,
            code=code
        ).order_by('-created_at').first()
        
        if not verification:
            raise serializers.ValidationError("Mã xác thực không hợp lệ")
            
        if not verification.is_valid():
            raise serializers.ValidationError("Mã xác thực đã hết hạn")
            
        attrs['user'] = user
        attrs['verification'] = verification
        return attrs

class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """
        Kiểm tra email đã tồn tại chưa
        """
        try:
            user = User.objects.get(email=value, is_active=False)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email không hợp lệ hoặc đã được xác thực")
            
        return value

class CheckVerificationStatusSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Email không tồn tại trong hệ thống")
