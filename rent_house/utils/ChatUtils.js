import { Alert } from 'react-native';
import { api } from './Fetch';

/**
 * Creates or gets an existing direct chat with a user and navigates to that chat
 * 
 * @param {number} userId - The ID of the user to chat with
 * @param {string} userName - Display name of the user (for the chat header)
 * @param {object} navigation - React Navigation object
 * @param {function} setLoading - Optional state setter for loading indicator
 * @returns {Promise<boolean>} Success status
 */
export const createDirectChat = async (userId, userName, navigation, setLoading = null) => {
  try {
    if (setLoading) setLoading(true);
    
    // Call the API to create or get existing direct chat
    const response = await api.post('/api/chats/create_direct_chat/', {
      user_id: userId
    });
    
    // Navigate to chat with the received chat ID
    if (response.data && response.data.id) {
      navigation.navigate('Chat', {
        screen: 'ChatDetail',
        params: { 
          chatId: response.data.id, 
          chatName: response.data.name || userName
        }
      });
      return true;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error creating direct chat:', error);
    Alert.alert(
      'Lỗi',
      'Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.',
      [{ text: 'OK' }]
    );
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Get chat details from route params
 * 
 * @param {object} route - React Navigation route object
 * @returns {object} Chat details (chatId, chatName)
 */
export const getChatDetailsFromRoute = (route) => {
  // First check if params exist at the top level (direct navigation)
  if (route?.params?.chatId) {
    return {
      chatId: route.params.chatId,
      chatName: route.params.chatName || '',
      userId: route.params.userId || null
    };
  }
  
  // Then check if params might be nested (stack navigation)
  if (route?.params?.params?.chatId) {
    return {
      chatId: route.params.params.chatId,
      chatName: route.params.params.chatName || '',
      userId: route.params.params.userId || null
    };
  }
  
  // Default return - will need to handle this case in components
  return { chatId: null, chatName: '', userId: null };
};

/**
 * Standardize chat navigation
 * 
 * @param {object} navigation - React Navigation navigation object
 * @param {object} chatDetails - Chat details (chatId, chatName)
 */
export const navigateToChat = (navigation, { chatId, chatName, userId = null }) => {
  if (!chatId) {
    console.error('Cannot navigate to chat: missing chatId');
    return false;
  }
  
  navigation.navigate('Chat', {
    screen: 'ChatDetail',
    params: { chatId, chatName, userId }
  });
  return true;
};
