from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Image, House, Room, Post, Comment, Message
from .utils import upload_image_to_cloudinary
import json

# Create your views here.
def index(request):
    return HttpResponse("Hello, world. You're at the rent_house index.")

# @csrf_exempt
# def upload_image(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
#     try:
#         # Check if request has files
#         if 'image' not in request.FILES:
#             return JsonResponse({'error': 'No image provided'}, status=400)
        
#         # Get related entity
#         data = request.POST
#         entity_type = data.get('entity_type')  # 'house', 'room', 'post', 'comment', 'message'
#         entity_id = data.get('entity_id')
        
#         # Upload to Cloudinary
#         image_file = request.FILES['image']
#         cloudinary_url = upload_image_to_cloudinary(image_file)
        
#         if not cloudinary_url:
#             return JsonResponse({'error': 'Failed to upload image to Cloudinary'}, status=500)
        
#         # Create image object with the URL
#         image = Image(url=cloudinary_url)
        
#         # Attach to related entity if provided
#         if entity_type and entity_id:
#             if entity_type == 'house':
#                 image.house = House.objects.get(id=entity_id)
#             elif entity_type == 'room':
#                 image.room = Room.objects.get(id=entity_id)
#             elif entity_type == 'post':
#                 image.post = Post.objects.get(id=entity_id)
#             elif entity_type == 'comment':
#                 image.comment = Comment.objects.get(id=entity_id)
#             elif entity_type == 'message':
#                 image.message = Message.objects.get(id=entity_id)
        
#         image.save()
        
#         return JsonResponse({
#             'id': image.id,
#             'url': image.url,
#             'success': True
#         })
    
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)