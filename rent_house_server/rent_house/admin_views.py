from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Count
from django.db.models.functions import TruncDay, TruncMonth
from datetime import datetime, timedelta

from rent_house.models import User, House, Post, Comment

@staff_member_required
def admin_dashboard(request):
    # Basic statistics
    user_count = User.objects.count()
    house_count = House.objects.count()
    post_count = Post.objects.count()
    
    # Get new registrations in the last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    new_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    
    # Get new posts in the last 30 days
    new_posts = Post.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Get users by role
    users_by_role = User.objects.values('role').annotate(count=Count('role'))
    
    # Get posts by day for the last 30 days
    posts_by_day = Post.objects.filter(
        created_at__gte=thirty_days_ago
    ).annotate(
        day=TruncDay('created_at')
    ).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    # Prepare data for charts (just placeholder data)
    posts_by_day_data = {
        'labels': [item['day'].strftime('%d %b') for item in posts_by_day],
        'data': [item['count'] for item in posts_by_day],
    }
    
    # Houses by province (top 5)
    houses_by_province = House.objects.values('province').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Pass all data to the template
    context = {
        'user_count': user_count,
        'house_count': house_count,
        'post_count': post_count,
        'new_users': new_users,
        'new_posts': new_posts,
        'users_by_role': users_by_role,
        'posts_by_day_data': posts_by_day_data,
        'houses_by_province': houses_by_province,
    }
    
    return render(request, 'admin/dashboard.html', context)
