import { apiClient } from './Api';

// Hàm lấy danh sách bài viết với phân trang
export const getFeedService = async (nextUrl = null, type = null) => {
  try {
    if (!nextUrl) {
      nextUrl = '/api/new-feed/';
    }
    const response = await apiClient.get(nextUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
};
