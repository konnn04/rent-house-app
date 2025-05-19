from django.contrib.auth import get_user_model
from datetime import datetime

def admin_dashboard_stats(request):
    """
    Add statistics for the admin dashboard
    """
    if request.path.startswith('/admin/'):
        User = get_user_model()
        today = datetime.now().strftime('%d %b, %Y')
        server_time = datetime.now().strftime('%H:%M:%S')
        
        context = {
            'user_count': User.objects.count(),
            'today': today,
            'server_time': server_time,
        }
        return context
    return {}
