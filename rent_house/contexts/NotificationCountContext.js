import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getUnreadChatsCount } from '../services/chatService';
import { getUnreadNotificationsCount } from '../services/notificationService';

const NotificationCountContext = createContext();

export const NotificationCountProvider = ({ children }) => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  }, []);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const count = await getUnreadChatsCount();
      setUnreadMessages(count);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  }, []);

  const refreshCounts = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchUnreadNotifications(),
      fetchUnreadMessages()
    ]);
    setLoading(false);
  }, [fetchUnreadNotifications, fetchUnreadMessages]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const resetNotificationCount = useCallback(() => {
    setUnreadNotifications(0);
  }, []);

  const resetMessageCount = useCallback(() => {
    setUnreadMessages(0);
  }, []);

  const readedOneNotification = useCallback(() => {
    setUnreadNotifications(prev => Math.max(prev - 1, 0));
  }, []);

  const readedOneMessage = useCallback(() => {
    setUnreadMessages(prev => Math.max(prev - 1, 0));
  }, []);

  const value = {
    unreadNotifications,
    unreadMessages,
    loading,
    refreshCounts,
    fetchUnreadNotifications,
    fetchUnreadMessages,
    resetNotificationCount,
    resetMessageCount,
    readedOneNotification,
    readedOneMessage
  };

  return (
    <NotificationCountContext.Provider value={value}>
      {children}
    </NotificationCountContext.Provider>
  );
};

export const useNotificationCount = () => {
  const context = useContext(NotificationCountContext);
  if (context === undefined) {
    throw new Error('useNotificationCount must be used within a NotificationCountProvider');
  }
  return context;
};
