import { apiClient } from './Api';

// Lấy danh sách chat có phân trang (lazy loading)
export const getChatsService = async (nextUrl = null) => {
  try {
    if (!nextUrl) {
      nextUrl = '/api/chats/';
    }
    const response = await apiClient.get(nextUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching my chats:', error);
    throw error;
  }
}

// Tổng quan chat
export const getInfoChatService = async (chatId) => {
  try {
    const response = await apiClient.get(`/api/chats/${chatId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat info:', error);
    throw error;
  }
}

// Tự rời khỏi chat
export const leaveChatService = async (chatId) => {
  try {
    const response = await apiClient.post(`/api/chats/${chatId}/leave_group/`);
    return response.data;
  } catch (error) {
    console.error('Error leaving chat:', error);
    throw error;
  }
}

// Lấy nội dung hộp chat (có lazy-load)
export const getChatContentService = async (chatId, nextUrl = null) => {
  try {
    if (!nextUrl) {
      nextUrl = `/api/chats/${chatId}/messages/`;
    }
    const response = await apiClient.get(nextUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat content:', error);
    throw error;
  }
}

// Sửa tin nhắn trong hộp chat
export const editMessageService = async (messageId, formData) => {
  try {
    const response = await apiClient.put(`/api/messages/${messageId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
}

// Xoá tin nhắn trong hộp chat
export const deleteMessageService = async (messageId) => {
  try {
    const response = await apiClient.delete(`/api/messages/${messageId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

// Trong hộp chat
// Gửi tin nhắn
export const sendMessageService = async (chatId, formData) => {
  try {
    const response = await apiClient.post(`/api/chats/${chatId}/send-message/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Tạo chat trực tiếp với người dùng khác
export const createDirectChatService = async (userId) => {
  try {
    const response = await apiClient.post('/api/chats/create_direct_chat/', {
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating direct chat:', error);
    throw error;
  }
}