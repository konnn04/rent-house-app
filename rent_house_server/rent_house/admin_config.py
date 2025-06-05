from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from .models import Report

def get_unresolved_reports_count(request):
    return str(Report.objects.filter(is_resolved=False).count())

def get_sidebar_config(request=None):
    return {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": _("Quản lý"),
                "items": [
                    {
                        "title": _("Dashboard"),
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                    {
                        "title": _("Users"),
                        "icon": "person",
                        "link": reverse_lazy("admin:rent_house_user_changelist"),
                    },
                    {
                        "title": _("Houses"),
                        "icon": "home",
                        "link": reverse_lazy("admin:rent_house_house_changelist"),
                    },
                    {
                        "title": _("Posts"),
                        "icon": "article",
                        "link": reverse_lazy("admin:rent_house_post_changelist"),
                    },
                    {
                        "title": _("Comments"),
                        "icon": "comment",
                        "link": reverse_lazy("admin:rent_house_comment_changelist"),
                    },
                    {
                        "title": _("Rates"),
                        "icon": "star",
                        "link": reverse_lazy("admin:rent_house_rate_changelist"),
                    },
                    {
                        "title": _("Media"),
                        "icon": "image",
                        "link": reverse_lazy("admin:rent_house_media_changelist"),
                    },
                    {
                        "title": _("Notifications"),
                        "icon": "notifications",
                        "link": reverse_lazy("admin:rent_house_notification_changelist"),
                    },
                    {
                        "title": _("Interactions"),
                        "icon": "thumb_up",
                        "link": reverse_lazy("admin:rent_house_interaction_changelist"),
                    },
                    {
                        "title": _("Follows"),
                        "icon": "person_add",
                        "link": reverse_lazy("admin:rent_house_follow_changelist"),
                    },
                ],
            },
            {
                "title": _("Verification & Reports"),
                "collapsible": True,
                "items": [
                    {
                        "title": _("Identity Verifications"),
                        "icon": "verified_user",
                        "link": reverse_lazy("admin:rent_house_identityverification_changelist"),
                    },
                    {
                        "title": _("User Reports"),
                        "icon": "report",
                        "link": reverse_lazy("admin:rent_house_report_changelist"),
                        "badge": get_unresolved_reports_count,
                    },
                    {
                        "title": _("Verification Codes"),
                        "icon": "vpn_key",
                        "link": reverse_lazy("admin:rent_house_verificationcode_changelist"),
                    },
                    {
                        "title": _("Password Reset Tokens"),
                        "icon": "lock_reset",
                        "link": reverse_lazy("admin:rent_house_passwordresettoken_changelist"),
                    },
                ],
            },
            {
                "title": _("Analytics"),
                "collapsible": True,
                "items": [
                    {
                        "title": _("Active Houses"),
                        "icon": "villa", 
                        "link": reverse_lazy("admin:rent_house_house_changelist") + "?is_verified__exact=1",
                    },
                    {
                        "title": _("Pending Verifications"),
                        "icon": "pending_actions",
                        "link": reverse_lazy("admin:rent_house_identityverification_changelist") + "?is_verified__exact=0",
                    },
                ],
            },
        ],
    }




