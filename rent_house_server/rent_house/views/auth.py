from rest_framework import generics, status, permissions, parsers
from rest_framework.response import Response
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
from django.views import View
from django.shortcuts import render
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rent_house.models import PasswordResetToken
import random
import string


from rent_house.models import User, VerificationCode
from rent_house.serializers import RegisterSerializer, VerifyEmailSerializer, ResendVerificationSerializer, CheckVerificationStatusSerializer, PreRegisterSerializer, RequestPasswordResetSerializer, PasswordResetSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser, parsers.FormParser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        response_data = {
            "message": "Đăng ký thành công! Hãy quay lại đăng nhập!",
            "user_id": user.id,
            "email": user.email,
            "avatar": user.avatar
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VerifyEmailSerializer
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        verification = serializer.validated_data['verification']
        
        user.is_active = True
        user.save()
        
        verification.mark_as_used()
        
        tokens = self.create_oauth_tokens(user)
        
        return Response({
            "message": "Xác thực tài khoản thành công!",
            "user_id": user.id,
            "access_token": tokens['access_token'],
            "refresh_token": tokens['refresh_token'],
            "expires_in": tokens['expires_in']
        }, status=status.HTTP_200_OK)
    
    def create_oauth_tokens(self, user):
        try:
            application = Application.objects.get(name="React Native App")
            expires = timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS)
            access_token = AccessToken.objects.create(
                user=user,
                application=application,
                token=generate_token(),
                expires=expires,
                scope='read write'
            )
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
            return {
                'error': 'Ứng dụng OAuth không tồn tại. Vui lòng kiểm tra lại cấu hình.'
            }

class ResendVerificationView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResendVerificationSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email, is_active=False)
        
        verification_code = VerificationCode.generate_code(user)
        
        self.send_verification_email(user, verification_code.code)
        
        response_data = {
            "message": "Mã xác thực mới đã được gửi đến email của bạn.",
            "email": email
        }
        
        # if settings.DEBUG:
        #     response_data["verification_code"] = verification_code.code
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def send_verification_email(self, user, code):
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
    permission_classes = [permissions.AllowAny]
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

class PreRegisterView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PreRegisterSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        verification_code = self.create_or_get_verification_code(email)
        
        self.send_verification_email(email, verification_code.code)
        
        response_data = {
            "message": "Mã xác thực đã được gửi đến email của bạn.",
            "email": email,
        }
        
        if settings.DEBUG:
            response_data["verification_code"] = verification_code.code
            
        return Response(response_data, status=status.HTTP_200_OK)
    
    def create_or_get_verification_code(self, email):
        existing_code = VerificationCode.objects.filter(
            user=None,
            email=email,
            is_used=False
        ).order_by('-created_at').first()
        
        if existing_code and existing_code.is_valid():
            return existing_code
            
        VerificationCode.objects.filter(
            user=None,
            email=email,
            is_used=False
        ).update(is_used=True)
        
        code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRY_MINUTES)
        
        verification_code = VerificationCode.objects.create(
            user=None,
            email=email,
            code=code,
            expires_at=expires_at
        )
        
        return verification_code
    
    def send_verification_email(self, email, code):
        subject = 'Xác thực email Rent House App'
        html_message = render_to_string('email/verify_email.html', {
            'email': email,
            'code': code,
            'expiry_minutes': settings.VERIFICATION_CODE_EXPIRY_MINUTES
        })
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                html_message=html_message,
                fail_silently=False
            )
            return True
        except Exception as e:
            print(f"Error sending verification email: {str(e)}")
            return False

class RequestPasswordResetView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RequestPasswordResetSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            reset_token = PasswordResetToken.generate_token(user)
            self.send_reset_email(user, reset_token.token)
            
        except User.DoesNotExist:
            pass
            
        return Response({
            "message": "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn (nếu email đã đăng ký)."
        }, status=status.HTTP_200_OK)
    
    def send_reset_email(self, user, token):
        from django.urls import reverse
        from django.contrib.sites.shortcuts import get_current_site
        
        current_site = get_current_site(self.request)
        domain = current_site.domain
        
        reset_path = reverse('web-password-reset', kwargs={'token': token})
        reset_url = f"http://{domain}{reset_path}"
        
        subject = 'Đặt lại mật khẩu Rent House App'
        html_message = render_to_string('email/reset_password.html', {
            'user': user,
            'reset_url': reset_url,
            'expiry_hours': 24 
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
            print(f"Error sending password reset email: {str(e)}")
            return False

class PasswordResetView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetSerializer
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']
        
        user = reset_token.user
        
        user.set_password(new_password)
        user.save()
        
        reset_token.mark_as_used()
        
        return Response({
            "message": "Mật khẩu đã được đặt lại thành công."
        }, status=status.HTTP_200_OK)
    
class WebPasswordResetView(View):
    permission_classes = [permissions.AllowAny]
    template_name = 'password_reset/reset_password.html'
    
    def get(self, request, token=None):
        if not token:
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ'
            })
            
        reset_token = PasswordResetToken.objects.filter(token=token, is_used=False).first()
        
        if not reset_token or not reset_token.is_valid():
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ hoặc đã hết hạn'
            })
            
        return render(request, self.template_name, {})
    
    @transaction.atomic
    def post(self, request, token=None):
        if not token:
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ'
            })
            
        reset_token = PasswordResetToken.objects.filter(token=token, is_used=False).first()
        
        if not reset_token or not reset_token.is_valid():
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ hoặc đã hết hạn'
            })
            
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        
        form_errors = {}
        
        if new_password != confirm_password:
            form_errors['confirm_password'] = ['Mật khẩu không khớp']
        
        try:
            validate_password(new_password)
        except ValidationError as e:
            form_errors['new_password'] = list(e)
        
        if form_errors:
            return render(request, self.template_name, {
                'form_errors': form_errors
            })
        
        user = reset_token.user
        
        user.set_password(new_password)
        user.save()
        
        reset_token.mark_as_used()
        
        return render(request, self.template_name, {
            'success': True
        })

