from oauth2_provider.oauth2_validators import OAuth2Validator

class CustomOAuth2Validator(OAuth2Validator):
    def validate_user(self, username, password, client, request, *args, **kwargs):
        if not username:  
            return False
            
        from rent_house.models import User
        user = User.objects.filter(username=username).first()
        if not user:
            return False
        
        return super().validate_user(username, password, client, request, *args, **kwargs)