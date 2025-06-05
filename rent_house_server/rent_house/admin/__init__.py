from django.contrib import admin
from django.contrib.auth.models import Group

# admin.site.unregister(Group)

# Import admin classes
from .identity_verification import IdentityVerificationAdmin
from .report import ReportAdmin
from .user import UserAdmin
from .house import HouseAdmin
from .post import PostAdmin
from .chat_group import ChatGroupAdmin
from .comment import CommentAdmin
from .rate import RateAdmin
from .media import MediaAdmin
from .notification import NotificationAdmin
from .interaction import InteractionAdmin
from .follow import FollowAdmin
from .verification_code import VerificationCodeAdmin
from .password_reset_token import PasswordResetTokenAdmin

