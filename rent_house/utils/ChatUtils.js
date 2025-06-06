import { Alert } from 'react-native';
import { createDirectChatService } from '../services/chatService';


export const createDirectChat = async (userId, userName, navigation, setLoading = null) => {
  try {
    if (setLoading) setLoading(true);
    
    const data = await createDirectChatService(userId);

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


export const getChatDetailsFromRoute = (route) => {
  if (route?.params?.chatId) {
    return {
      chatId: route.params.chatId,
      chatName: route.params.chatName || '',
      userId: route.params.userId || null
    };
  }
  
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
  const now = new Date().toISOString();
  const tempId = `temp-${Date.now()}`;
  
  const mediaItems = images.map((img, index) => ({
    id: `temp-media-${index}`,
    url: img.uri,
    thumbnail: img.uri,
    media_type: 'image',
    isUploading: true
  }));
  
  return {
    id: tempId,
    chat_group: null, 
    content: content || '',
    created_at: now,
    updated_at: now,
    sender: {
      id: userData.id,
      username: userData.username,
      full_name: userData.first_name + ' ' + userData.last_name,
      avatar: userData.avatar,
      avatar_thumbnail: userData.avatar
    },
    is_system_message: false,
    is_removed: false,
    replied_to: replyingTo,
    media: mediaItems,
    isOptimistic: true 
  };
};
