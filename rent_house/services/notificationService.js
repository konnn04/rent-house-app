import { apiClient } from './Api';

export const getNotificationsService = async (nextUrl = null) => {
  try {
    if (!nextUrl) {
      nextUrl = '/api/notifications/';
    }
    const response = await apiClient.get(nextUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export const markNotificationAsReadService = async (notificationId) => {
  try {
    const response = await apiClient.patch(`/api/notifications/${notificationId}/mark_as_read/`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export const markAllNotificationsAsReadService = async () => {
  try {
    const response = await apiClient.post('/api/notifications/mark_all_as_read/');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export const deleteNotificationService = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/api/notifications/${notificationId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}