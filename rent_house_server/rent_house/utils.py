import cloudinary
import cloudinary.uploader
import os
import uuid
from typing import Optional

from rest_framework.response import Response
from rest_framework import status


def upload_image_to_cloudinary(image_file, folder="rent_house") -> Optional[str]:
    try:
        public_id = f"{folder}/{uuid.uuid4()}"
        
        result = cloudinary.uploader.upload(
            image_file,
            public_id=public_id,
            folder=folder,
            resource_type="image",
            overwrite=False
        )
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None

def delete_cloudinary_image(url: str) -> bool:
    try:
        parts = url.split('/')
        if len(parts) < 2:
            return False
            
        filename = parts[-1]
        folder = parts[-2] if len(parts) > 2 else ""
        
        public_id = os.path.splitext(filename)[0]
        if folder:
            public_id = f"{folder}/{public_id}"
            
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Error deleting from Cloudinary: {e}")
        return False
    
class ApiResponse:
    @staticmethod
    def success(data=None, message=None, status_code=status.HTTP_200_OK):
        response_data = {
            "status": "success",
            "message": message,
        }
        
        if data is not None:
            response_data["data"] = data
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        response_data = {
            "status": "error",
            "message": message,
        }
        
        if errors is not None:
            response_data["errors"] = errors
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def created(data=None, message="Tạo thành công", status_code=status.HTTP_201_CREATED):
        return ApiResponse.success(data, message, status_code)
        
    @staticmethod
    def deleted(message="Xóa thành công", status_code=status.HTTP_204_NO_CONTENT):
        return Response({"status": "success", "message": message}, status=status_code)