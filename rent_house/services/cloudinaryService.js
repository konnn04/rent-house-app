import { apiClient } from './Api';

export const uploadImagesToServer = async (images, token) => {
  const formData = new FormData();
  images.forEach((img, idx) => {
    formData.append('avatars', {
      uri: img.uri,
      type: img.type || 'image/jpeg',
      name: img.name || `image${idx}.jpg`,
    });
  });

  const res = await apiClient.post('/api/upload-image/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.urls; 
};