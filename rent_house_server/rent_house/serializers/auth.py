from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q

from rent_house.models import User, VerificationCode, PasswordResetToken
from rent_house.utils import upload_image_to_cloudinary

class PreRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được đăng ký.")
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    verification_code = serializers.CharField(write_only=True, required=True)
    avatar = serializers.ImageField(required=True, write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 
                 'last_name', 'phone_number', 'role', 'verification_code', 'avatar')
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được đăng ký.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên đăng nhập đã được sử dụng.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
        
        # Kiểm độ mạnh có sẳn trong Django
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
        password2 = validated_data.pop('password2')
        verification_code = validated_data.pop('verification_code')
        avatar_file = validated_data.pop('avatar')
        
        avatar_url = upload_image_to_cloudinary(avatar_file, folder="user_avatars")
        if not avatar_url:
            raise serializers.ValidationError({"avatar": "Không thể tải lên ảnh đại diện. Vui lòng thử lại."})
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', 'renter'),
            is_active=True,
            avatar=avatar_url 
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        # Đánh dấu mã xác thực cửa người này đã sử dụng
        self.verification.is_used = True
        self.verification.user = user 
        self.verification.save()
        
        # Tạo bản ghi media cho ảnh đại diện
        from django.contrib.contenttypes.models import ContentType
        from rent_house.models import Media
        
        Media.objects.create(
            content_type=ContentType.objects.get_for_model(User),
            object_id=user.id,
            url=avatar_url,
            media_type='image',
            purpose='avatar'
        )
        
        return user

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        
        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email không hợp lệ hoặc đã được xác thực")
        
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
        try:
            user = User.objects.get(email=value)
            return value
        except User.DoesNotExist:
            return value

class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        token = attrs.get('token')
        
        reset_token = PasswordResetToken.objects.filter(token=token, is_used=False).first()
        if not reset_token:
            raise serializers.ValidationError({"token": "Token không hợp lệ hoặc đã hết hạn"})
        
        if not reset_token.is_valid():
            raise serializers.ValidationError({"token": "Token đã hết hạn"})
        
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Mật khẩu không khớp"})
        
        try:
            validate_password(attrs.get('new_password'))
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e)})
            
        attrs['reset_token'] = reset_token
        return attrs

