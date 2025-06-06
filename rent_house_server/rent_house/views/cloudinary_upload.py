from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, parsers

from rent_house.utils import upload_image_to_cloudinary

class CloudinaryUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        images = request.FILES.getlist('images') or request.FILES.getlist('image')
        if not images:
            return Response({"error": "Thiếu file ảnh (images)"}, status=status.HTTP_400_BAD_REQUEST)
        urls = []
        for image in images:
            url = upload_image_to_cloudinary(image)
            if url:
                urls.append(url)
            else:
                return Response({"error": f"Upload thất bại cho ảnh {image.name}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"urls": urls}, status=status.HTTP_200_OK)