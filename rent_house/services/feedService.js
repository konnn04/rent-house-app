import { apiClient } from './Api';

export const getFeedService = async (nextUrl = null, type = null) => {
  try {
    if (!nextUrl) {
      nextUrl = '/api/posts/';
    }
    const response = await apiClient.get(nextUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
};
