import { off, onValue, push, ref, set, update } from "firebase/database";
import { db } from '../firebase';

export const sendMessage = async (chatId, message, imageUrls = []) => {
  const messagesRef = ref(db, `chats/${chatId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    ...message,
    id: newMsgRef.key,
    media: imageUrls.map((url, index) => ({
      url,
      thumbnail: url, 
      medium: url, 
      type: 'image',
      index,
    })),
    is_removed: false,
    edited_at: null,
    timestamp: Date.now().toString(),
  });
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = ref(db, `chats/${chatId}/messages`);
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val() || {};
    const messages = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
  return () => off(messagesRef, 'value', unsubscribe);
};

export const editMessage = async (chatId, messageId, newContent) => {
  const msgRef = ref(db, `chats/${chatId}/messages/${messageId}`);
  await update(msgRef, {
    content: newContent,
    edited_at: Date.now(),
    timestamp: Date.now().toString(),
  });
};

export const removeMessage = async (chatId, messageId) => {
  const msgRef = ref(db, `chats/${chatId}/messages/${messageId}`);
  await update(msgRef, {
    is_removed: true,
    content: "Tin nhắn đã bị xóa",
  });
};