from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q

from rent_house.models import User, VerificationCode, PasswordResetToken

class PreRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """
        Validate that the email is not already registered
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được đăng ký.")
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    verification_code = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 
                 'last_name', 'phone_number', 'role', 'verification_code')
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
        Kiểm tra mật khẩu khớp nhau không và mã xác thực hợp lệ
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
        
        # Kiểm tra mật khẩu có đủ mạnh không
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e)})
        
        # Kiểm tra mã xác thực
        email = attrs['email']
        code = attrs['verification_code']
        
        verification = VerificationCode.objects.filter(
            email=email,
            code=code,
            user=None,
            is_used=False
        ).order_by('-created_at').first()
        
        if not verification:
            raise serializers.ValidationError({"verification_code": "Mã xác thực không hợp lệ."})
        
        if not verification.is_valid():
            raise serializers.ValidationError({"verification_code": "Mã xác thực đã hết hạn."})
        
        # Lưu đối tượng verification để sử dụng trong create()
        self.verification = verification
            
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        # Xóa trường không cần thiết
        validated_data.pop('password2')
        validated_data.pop('verification_code')
        
        # Tạo user và kích hoạt luôn (đã xác thực email)
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', 'renter'),
            is_active=True  # Kích hoạt ngay vì đã xác thực email
        )
        
        # Đặt mật khẩu
        user.set_password(validated_data['password'])
        user.save()
        
        # Đánh dấu mã xác thực đã sử dụng
        self.verification.is_used = True
        self.verification.user = user  # Liên kết với user mới tạo
        self.verification.save()
        
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
    email_or_username = serializers.CharField(required=True)
    def validate_email_or_username(self, value):
        try:
            self.user = User.objects.filter(
                Q(email=value) | Q(username=value)
            ).first()
            if not self.user:
                raise serializers.ValidationError("Username hoặc email không tồn tại trong hệ thống")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Username hoặc email không tồn tại trong hệ thống")

# Quên mật khẩu
class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Kiểm tra email có tồn tại không"""
        try:
            user = User.objects.get(email=value)
            return value
        except User.DoesNotExist:
            # Không báo lỗi rõ ràng để tránh lộ thông tin về tài khoản tồn tại
            return value

class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        """Kiểm tra token và mật khẩu"""
        token = attrs.get('token')
        
        # Kiểm tra token có tồn tại và hợp lệ không
        reset_token = PasswordResetToken.objects.filter(token=token, is_used=False).first()
        if not reset_token:
            raise serializers.ValidationError({"token": "Token không hợp lệ hoặc đã hết hạn"})
        
        if not reset_token.is_valid():
            raise serializers.ValidationError({"token": "Token đã hết hạn"})
        
        # Kiểm tra mật khẩu khớp nhau không
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Mật khẩu không khớp"})
        
        # Kiểm tra độ mạnh của mật khẩu
        try:
            validate_password(attrs.get('new_password'))
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e)})
            
        attrs['reset_token'] = reset_token
        return attrs
    
