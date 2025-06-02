import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './Api';

// Firebase

export const registerFcmToken = async () => {
  const authStatus = await messaging().requestPermission();
  if (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  ) {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await AsyncStorage.setItem('fcm_token', fcmToken);
      // Gửi token lên server
      await apiClient.post('/api/users/register_fcm_token/', { token: fcmToken });
    }
  }
};
// API
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

