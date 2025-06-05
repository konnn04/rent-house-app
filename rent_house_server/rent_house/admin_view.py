def dashboard_callback(request, context):
    from rent_house.models import House, Post, Report, User
    from django.db.models import Count, Q
    from django.utils import timezone
    from django.core.serializers.json import DjangoJSONEncoder
    import datetime
    import json
    
    now = timezone.now()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    previous_month_start = (current_month_start - datetime.timedelta(days=1)).replace(day=1)
    
    user_count = User.objects.count()
    house_count = House.objects.count()
    post_count = Post.objects.count()
    report_count = Report.objects.count()
    
    previous_month_user_count = User.objects.filter(date_joined__lt=current_month_start).count()
    user_growth = 0
    if previous_month_user_count > 0:
        user_growth = round(((user_count - previous_month_user_count) / previous_month_user_count) * 100, 1)
    
    available_houses = House.objects.filter(is_renting=True).count()
    rented_houses = House.objects.filter(is_renting=False).count()
    
    posts_this_month = Post.objects.filter(created_at__gte=current_month_start).count()
    
    unresolved_reports = Report.objects.filter(is_resolved=False).count()
    
    last_six_months = []
    for i in range(5, -1, -1):
        month_date = (now - datetime.timedelta(days=30 * i)).replace(day=1)
        month_name = month_date.strftime('%B')
        last_six_months.append(month_name)
    
    chart_data = {
        'labels': last_six_months,
        'datasets': [
            {
                'label': 'Người dùng mới',
                'data': [
                    User.objects.filter(
                        date_joined__gte=(now - datetime.timedelta(days=30 * (i + 1))).replace(day=1),
                        date_joined__lt=(now - datetime.timedelta(days=30 * i)).replace(day=1) if i > 0 else now
                    ).count() for i in range(5, -1, -1)
                ],
                'borderColor': '#60a5fa',
                'backgroundColor': 'rgba(96, 165, 250, 0.2)',
            },
            {
                'label': 'Nhà cho thuê mới',
                'data': [
                    House.objects.filter(
                        created_at__gte=(now - datetime.timedelta(days=30 * (i + 1))).replace(day=1),
                        created_at__lt=(now - datetime.timedelta(days=30 * i)).replace(day=1) if i > 0 else now
                    ).count() for i in range(5, -1, -1)
                ],
                'borderColor': '#f87171',
                'backgroundColor': 'rgba(248, 113, 113, 0.2)',
            },
            {
                'label': 'Bài đăng mới',
                'data': [
                    Post.objects.filter(
                        created_at__gte=(now - datetime.timedelta(days=30 * (i + 1))).replace(day=1),
                        created_at__lt=(now - datetime.timedelta(days=30 * i)).replace(day=1) if i > 0 else now
                    ).count() for i in range(5, -1, -1)
                ],
                'borderColor': '#34d399',
                'backgroundColor': 'rgba(52, 211, 153, 0.2)',
            }
        ]
    }
    
    context.update({
        'user_count': user_count,
        'house_count': house_count,
        'post_count': post_count,
        'report_count': report_count,
        'user_growth': user_growth,
        'available_houses': available_houses,
        'rented_houses': rented_houses,
        'posts_this_month': posts_this_month,
        'unresolved_reports': unresolved_reports,
        'current_month': now.strftime('%B %Y'),
        'chart_data': json.dumps(chart_data, cls=DjangoJSONEncoder),
    })
    
    return context