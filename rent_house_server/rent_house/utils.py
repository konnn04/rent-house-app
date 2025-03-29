import cloudinary
import cloudinary.uploader
import os
import uuid
from typing import Optional

def upload_image_to_cloudinary(image_file, folder="rent_house") -> Optional[str]:
    """
    Tải ảnh lên Cloudinary và trả về URL của ảnh đã tải lên
    Nếu không tải được ảnh lên thì trả về None
    """
    try:
        # Generate a unique public_id to prevent overwrites
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
    """
    Xoá ảnh từ Cloudinary
    Trả về True nếu thành công, ngược lại trả về False
    """
    try:
        # Extract public_id from URL
        # URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.ext
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