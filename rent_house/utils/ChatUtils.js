import { Alert } from 'react-native';
import { createDirectChatService } from '../services/chatService';

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
    const data = await createDirectChatService(userId);

    // Navigate to chat with the received chat ID
    if (data && data.id) {
      navigation.navigate('Chat', {
        screen: 'ChatDetail',
        params: { 
          chatId: data.id, 
          chatName: data.name || userName
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

/**
 * Create an optimistic message for immediate UI feedback before API call completes
 * 
 * @param {string} content - Message text content
 * @param {object} userData - Current user data
 * @param {object} replyingTo - Message being replied to (optional)
 * @param {array} images - Array of image objects (optional)
 * @returns {object} Temporary message object
 */
export const createOptimisticMessage = (content, userData, replyingTo = null, images = []) => {
  // Generate a temporary ID (negative to avoid conflicts with server IDs)
  const tempId = -Math.floor(Math.random() * 1000000);
  
  // Current timestamp
  const now = new Date().toISOString();
  
  // Format media items if present
  const mediaItems = images.map((img, index) => ({
    id: `temp-${index}-${tempId}`,
    type: 'image',
    url: img.uri,
    thumbnail: img.uri,
  }));
  
  // Create the optimistic message object
  return {
    id: tempId,
    content: content || '',
    created_at: now,
    updated_at: now,
    sender: {
      id: userData?.id,
      username: userData?.username,
      full_name: userData?.full_name || userData?.username,
      avatar: userData?.avatar,
    },
    is_read: true,
    is_sender: true,
    is_optimistic: true,  // Flag to identify this as a temporary message
    replied_to: replyingTo,
    medias: mediaItems.length > 0 ? mediaItems : null,
  };
};
