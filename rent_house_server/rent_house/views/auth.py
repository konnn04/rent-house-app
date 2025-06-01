from rest_framework import generics, status, permissions
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
        # if settings.DEBUG:
        #     response_data["verification_code"] = verification_code.code
        
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

class PreRegisterView(generics.GenericAPIView):
    """
    API để gửi mã xác thực trước khi đăng ký.
    Xác minh email trước khi tạo tài khoản người dùng.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = PreRegisterSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Kiểm tra xem email đã tồn tại chưa
        if User.objects.filter(email=email).exists():
            return Response(
                {"email": ["Email đã được đăng ký."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tạo hoặc lấy một mã xác thực tạm thời cho email này
        verification_code = self.create_or_get_verification_code(email)
        
        # Gửi mã xác thực qua email
        self.send_verification_email(email, verification_code.code)
        
        response_data = {
            "message": "Mã xác thực đã được gửi đến email của bạn.",
            "email": email,
        }
        
        # Trả về mã xác thực trong môi trường phát triển
        if settings.DEBUG:
            response_data["verification_code"] = verification_code.code
            
        return Response(response_data, status=status.HTTP_200_OK)
    
    def create_or_get_verification_code(self, email):
        """
        Tạo hoặc lấy mã xác thực cho email chưa đăng ký
        """
        # Sử dụng một user tạm thời hoặc tạo một cơ chế riêng để lưu mã xác thực
        # Ở đây, chúng ta sẽ sử dụng một bản ghi VerificationCode với user=None và lưu email
        existing_code = VerificationCode.objects.filter(
            user=None,
            email=email,
            is_used=False
        ).order_by('-created_at').first()
        
        # Nếu đã có mã và còn hạn, sử dụng lại
        if existing_code and existing_code.is_valid():
            return existing_code
            
        # Vô hiệu hóa các mã cũ
        VerificationCode.objects.filter(
            user=None,
            email=email,
            is_used=False
        ).update(is_used=True)
        
        # Tạo mã mới
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
        """
        Gửi email xác thực đến địa chỉ email
        """
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
    """
    API để yêu cầu đặt lại mật khẩu qua email
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = RequestPasswordResetSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Tìm user bằng email
        try:
            user = User.objects.get(email=email)
            
            # Tạo token đặt lại mật khẩu
            reset_token = PasswordResetToken.generate_token(user)
            
            # Gửi email chứa link đặt lại mật khẩu
            self.send_reset_email(user, reset_token.token)
            
        except User.DoesNotExist:
            # Vì lý do bảo mật, vẫn trả về thành công ngay cả khi email không tồn tại
            pass
            
        return Response({
            "message": "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn (nếu email đã đăng ký)."
        }, status=status.HTTP_200_OK)
    
    def send_reset_email(self, user, token):
        # Sử dụng reverse để tạo URL tuyệt đối
        from django.urls import reverse
        from django.contrib.sites.shortcuts import get_current_site
        
        # Lấy domain hiện tại
        current_site = get_current_site(self.request)
        domain = current_site.domain
        
        # Tạo URL đầy đủ
        reset_path = reverse('web-password-reset', kwargs={'token': token})
        reset_url = f"http://{domain}{reset_path}"
        
        subject = 'Đặt lại mật khẩu Rent House App'
        html_message = render_to_string('email/reset_password.html', {
            'user': user,
            'reset_url': reset_url,
            'expiry_hours': 24  # Token có hiệu lực trong 24 giờ
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
    """
    API để đặt lại mật khẩu sử dụng token hợp lệ
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']
        
        # Lấy user từ token
        user = reset_token.user
        
        # Đặt mật khẩu mới
        user.set_password(new_password)
        user.save()
        
        # Đánh dấu token đã sử dụng
        reset_token.mark_as_used()
        
        return Response({
            "message": "Mật khẩu đã được đặt lại thành công."
        }, status=status.HTTP_200_OK)
    

# Thêm view mới này vào cuối file
class WebPasswordResetView(View):
    """
    View để hiển thị và xử lý form đặt lại mật khẩu trên web
    """
    template_name = 'password_reset/reset_password.html'
    
    def get(self, request, token=None):
        if not token:
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ'
            })
            
        # Kiểm tra token có hợp lệ không
        reset_token = PasswordResetToken.objects.filter(token=token, is_used=False).first()
        
        if not reset_token or not reset_token.is_valid():
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ hoặc đã hết hạn'
            })
            
        return render(request, self.template_name, {})
    
    def post(self, request, token=None):
        if not token:
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ'
            })
            
        # Kiểm tra token có hợp lệ không
        reset_token = PasswordResetToken.objects.filter(token=token, is_used=False).first()
        
        if not reset_token or not reset_token.is_valid():
            return render(request, self.template_name, {
                'error': 'Token không hợp lệ hoặc đã hết hạn'
            })
            
        # Lấy mật khẩu mới từ form
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        
        form_errors = {}
        
        # Kiểm tra mật khẩu khớp nhau không
        if new_password != confirm_password:
            form_errors['confirm_password'] = ['Mật khẩu không khớp']
        
        # Kiểm tra độ mạnh của mật khẩu
        try:
            validate_password(new_password)
        except ValidationError as e:
            form_errors['new_password'] = list(e)
        
        if form_errors:
            return render(request, self.template_name, {
                'form_errors': form_errors
            })
        
        # Lấy user từ token
        user = reset_token.user
        
        # Đặt mật khẩu mới
        user.set_password(new_password)
        user.save()
        
        # Đánh dấu token đã sử dụng
        reset_token.mark_as_used()
        
        return render(request, self.template_name, {
            'success': True
        })

