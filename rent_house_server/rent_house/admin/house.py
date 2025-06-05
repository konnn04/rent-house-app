from django.contrib import admin
from django.utils.html import format_html
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse

from unfold.paginator import InfinitePaginator
from unfold.admin import ModelAdmin
from unfold.decorators import action

from ..models import House


@admin.register(House)
class HouseAdmin(ModelAdmin):
    paginator_class = InfinitePaginator
    list_per_page = 20  
    list_display = ('id', 'display_thumbnail', 'title', 'owner', 'address_snippet', 'type', 'is_verified', 'is_renting', 'created_at')
    search_fields = ('title', 'owner__username', 'address')
    list_filter = ('is_verified', 'is_renting', 'type', 'created_at')
    readonly_fields = ('display_thumbnail', 'display_images', 'created_at', 'updated_at', 'owner', 'display_map')
    ordering = ('-created_at',)
    actions_row = ["verify_house", "toggle_renting_status"]
    list_fullwidth = True
    list_filter_sheet = False
    
    @action(description="Verify House")
    def verify_house(self, request, object_id):
        house = House.objects.get(id=object_id)
        house.is_verified = True
        house.save()
        messages.success(request, f"House '{house.title}' has been verified.")
        return HttpResponseRedirect(reverse('admin:rent_house_house_changelist'))
    
    @action(description="Toggle Renting Status")
    def toggle_renting_status(self, request, object_id):
        house = House.objects.get(id=object_id)
        house.is_renting = not house.is_renting
        house.save()
        status = "available for rent" if house.is_renting else "not available for rent"
        messages.success(request, f"House '{house.title}' is now {status}.")
        return HttpResponseRedirect(reverse('admin:rent_house_house_changelist'))
    
    def display_thumbnail(self, obj):
        thumbnail = obj.get_thumbnail()
        if thumbnail:
            return format_html('<img src="{}" width="100" />', thumbnail)
        return "No Image"
    display_thumbnail.short_description = 'Thumbnail'
    
    def display_images(self, obj):
        images = obj.media_files.filter(media_type='image')
        if images:
            html = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">'
            for img in images:
                html += f'<img src="{img.url}" width="300" height="300 style="object-fit:cover;margin-bottom: 10px;" />'
            html += '</div>'
            return format_html(html)
        return "No Images"
    display_images.short_description = 'Images'
    
    def address_snippet(self, obj):
        if obj.address and len(obj.address) > 40:
            return f"{obj.address[:40]}..."
        return obj.address
    address_snippet.short_description = 'Address'
    
    def display_map(self, obj):
        if obj.latitude and obj.longitude:
            # Google Maps iframe example
            return format_html(
                '<iframe width="100%" height="400" frameborder="0" style="border:0" '
                'src="https://www.google.com/maps?q={},{}&hl=vi&z=16&output=embed" allowfullscreen></iframe>',
                obj.latitude, obj.longitude
            )
        return "No location"
    display_map.short_description = "Map"

    fieldsets = (
        (None, {
            'fields': ('owner', 'title', 'description', 'type', 'display_images')
        }),
        ('Địa điểm', {
            'fields': ('address', 'latitude', 'longitude', 'display_map')
        }),
        ('Chi phí', {
            'fields': ('base_price', 'water_price', 'electricity_price', 'internet_price', 'trash_price', 'deposit')
        }),
        ('Tình trạng', {
            'fields': ('is_verified', 'is_renting')
        }),
        ('Property Details', {
            'fields': ('area', 'max_rooms', 'current_rooms', 'max_people')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
