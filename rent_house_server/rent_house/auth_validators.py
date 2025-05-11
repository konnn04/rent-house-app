from oauth2_provider.oauth2_validators import OAuth2Validator

class CustomOAuth2Validator(OAuth2Validator):
    def validate_user(self, username, password, client, request, *args, **kwargs):
        """
        Ngăn tạo tài khoản mới khi xác thực thất bại
        """
        if not username:  # Ngăn trường hợp username rỗng
            return False
            
        # Kiểm tra xem user có tồn tại không trước khi xác thực
        from rent_house.models import User
        user = User.objects.filter(username=username).first()
        if not user:
            # Nếu user không tồn tại, không cần xác thực
            return False
        
        # Nếu user tồn tại, gọi phương thức gốc để xác thực
        return super().validate_user(username, password, client, request, *args, **kwargs)