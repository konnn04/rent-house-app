from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.db import transaction
from oauth2_provider.models import Application
from oauth2_provider.settings import oauth2_settings
from oauthlib.common import generate_token
from django.utils import timezone
from datetime import timedelta
from oauth2_provider.models import AccessToken, RefreshToken

from rent_house.models import User, VerificationCode
from rent_house.serializers import RegisterSerializer, VerifyEmailSerializer, ResendVerificationSerializer, CheckVerificationStatusSerializer

class RegisterView(generics.CreateAPIView):
    """
    API để đăng ký tài khoản mới.
    Trả về 201 CREATED nếu thành công và gửi email xác thực.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Tạo user mới
        user = serializer.save()
        
        # Lấy mã xác thực mới tạo
        verification_code = VerificationCode.objects.filter(
            user=user, 
            is_used=False
        ).order_by('-created_at').first()
        
        if verification_code:
            # Gửi email xác thực
            self.send_verification_email(user, verification_code.code)
        
        # Trả về thông tin cần thiết cho app mobile
        response_data = {
            "message": "Đăng ký thành công! Vui lòng xác thực tài khoản.",
            "user_id": user.id,
            "email": user.email,
        }
        
        # Nếu đang ở môi trường phát triển, trả về mã xác thực để testing
        if settings.DEBUG:
            response_data["verification_code"] = verification_code.code
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def send_verification_email(self, user, code):
        """
        Gửi email xác thực đến người dùng
        """
        subject = 'Xác thực tài khoản Rent House App'
        html_message = render_to_string('email/verify_email.html', {
            'user': user,
            'code': code,
            'expiry_minutes': settings.VERIFICATION_CODE_EXPIRY_MINUTES
        })
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_message,
                fail_silently=False
            )
            return True
        except Exception as e:
            # Log lỗi nếu có
            print(f"Error sending verification email: {str(e)}")
            return False

class VerifyEmailView(generics.GenericAPIView):
    """
    API để xác thực email với mã xác thực.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = VerifyEmailSerializer
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        verification = serializer.validated_data['verification']
        
        # Kích hoạt tài khoản
        user.is_active = True
        user.save()
        
        # Đánh dấu mã xác thực đã sử dụng
        verification.mark_as_used()
        
        # Tạo OAuth2 tokens cho người dùng để đăng nhập ngay
        tokens = self.create_oauth_tokens(user)
        
        return Response({
            "message": "Xác thực tài khoản thành công!",
            "user_id": user.id,
            "access_token": tokens['access_token'],
            "refresh_token": tokens['refresh_token'],
            "expires_in": tokens['expires_in']
        }, status=status.HTTP_200_OK)
    
    def create_oauth_tokens(self, user):
        """
        Tạo OAuth2 tokens cho người dùng
        """
        try:
            # Tìm ứng dụng mobile trong database
            application = Application.objects.get(name="React Native App")
            
            # Tính thời gian hết hạn cho access token
            expires = timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS)
            
            # Tạo access token
            access_token = AccessToken.objects.create(
                user=user,
                application=application,
                token=generate_token(),
                expires=expires,
                scope='read write'
            )
            
            # Tạo refresh token
            refresh_token = RefreshToken.objects.create(
                user=user,
                application=application,
                token=generate_token(),
                access_token=access_token
            )
            
            return {
                'access_token': access_token.token,
                'refresh_token': refresh_token.token,
                'expires_in': oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS
            }
        except Application.DoesNotExist:
            # Nếu không tìm thấy ứng dụng, tạo một cái mới
            application = Application.objects.create(
                name="React Native App",
                client_type=Application.CLIENT_CONFIDENTIAL,
                authorization_grant_type=Application.GRANT_PASSWORD,
                skip_authorization=True,
                user=User.objects.filter(is_superuser=True).first()
            )
            
            # Gọi lại hàm để tạo tokens
            return self.create_oauth_tokens(user)

class ResendVerificationView(generics.GenericAPIView):
    """
    API để gửi lại mã xác thực qua email.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = ResendVerificationSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email, is_active=False)
        
        # Tạo mã xác thực mới
        verification_code = VerificationCode.generate_code(user)
        
        # Gửi email
        self.send_verification_email(user, verification_code.code)
        
        response_data = {
            "message": "Mã xác thực mới đã được gửi đến email của bạn.",
            "email": email
        }
        
        # Nếu đang ở môi trường phát triển, trả về mã xác thực để testing
        if settings.DEBUG:
            response_data["verification_code"] = verification_code.code
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def send_verification_email(self, user, code):
        """
        Gửi email xác thực đến người dùng
        """
        subject = 'Xác thực tài khoản Rent House App'
        html_message = render_to_string('email/verify_email.html', {
            'user': user,
            'code': code,
            'expiry_minutes': settings.VERIFICATION_CODE_EXPIRY_MINUTES
        })
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_message,
                fail_silently=False
            )
            return True
        except Exception as e:
            # Log lỗi nếu có
            print(f"Error sending verification email: {str(e)}")
            return False

class CheckVerificationStatusView(generics.GenericAPIView):
    """
    API để kiểm tra trạng thái xác thực của một tài khoản
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = CheckVerificationStatusSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.user
        
        return Response({
            "is_verified": user.is_active,
            "email": user.email,
            "user_id": user.id,
            "username": user.username
        })
