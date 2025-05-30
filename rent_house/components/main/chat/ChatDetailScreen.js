import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';
import { getChatDetailsFromRoute } from '../../../utils/ChatUtils';
import { api } from '../../../utils/Fetch';

// Import custom components
import { ChatHeader } from './components/ChatHeader';
import { Message } from './components/Message';
import { MessageActions } from './components/MessageActions';
import { MessageInput } from './components/MessageInput';

export const ChatDetailScreen = () => {
  const { colors } = useTheme();
  const { userData } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);

  // Get chat details using our utility
  const { chatId } = getChatDetailsFromRoute(route);

  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);

  // Message actions modal state
  const [actionsVisible, setActionsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageActionPosition, setMessageActionPosition] = useState({ x: 0, y: 0 });

  // Track if we should scroll to bottom after adding a new message
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);


  // Fetch chat details
  const fetchChatDetails = useCallback(async () => {
    try {
      if (!chatId) {
        setError('Không tìm thấy ID cuộc trò chuyện');
        setLoading(false);
        return;
      }

      setError(null);
      if (!refreshing) setLoading(true);

      const response = await api.get(`/api/chats/${chatId}/`);
      setChatData(response.data);

    } catch (err) {
      console.error('Error fetching chat data:', err);
      setError('Không thể tải thông tin chat. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatId, refreshing]);

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum = 1, loadMore = false) => {
    if (!chatId) return;

    try {
      if (!loadMore) {
        setMessageLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get(`/api/chats/${chatId}/messages/?page=${pageNum}&page_size=20`);

      if (response.data.results) {
        if (loadMore) {
          setMessages(prevMessages => [...prevMessages, ...response.data.results]);
        } else {
          setMessages(response.data.results);
        }

        setHasMorePages(!!response.data.next);
        setPage(pageNum);
      }

    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!loadMore) {
        setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
      }
    } finally {
      setMessageLoading(false);
      setLoadingMore(false);
    }
  }, [chatId]);

  // Scroll to bottom if flag is set
  useEffect(() => {
    if (shouldScrollToBottom && flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  // Initial data loading
  useEffect(() => {
    fetchChatDetails();
    fetchMessages();
  }, [fetchChatDetails, fetchMessages]);

  // Handle message long press
  const handleMessageLongPress = (message, event) => {
    setSelectedMessage(message);
    
    // Calculate position for the menu
    const { pageX, pageY } = event.nativeEvent;
    setMessageActionPosition({ x: pageX, y: pageY });
    
    setActionsVisible(true);
  };

  // Handle message deletion
  const handleDeleteMessage = async (message) => {
    try {
      Alert.alert(
        'Xóa tin nhắn',
        'Bạn có chắc muốn xóa tin nhắn này?',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await api.delete(`/api/chats/${chatId}/messages/${message.id}/`);
                // Update message locally to show as deleted
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === message.id ? { ...msg, is_removed: true } : msg
                  )
                );
              } catch (error) {
                console.error('Error deleting message:', error);
                Alert.alert('Lỗi', 'Không thể xóa tin nhắn. Vui lòng thử lại sau.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error showing delete alert:', error);
    }
  };

  // Refresh data on pull
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChatDetails();
    fetchMessages(1, false);
  }, [fetchChatDetails, fetchMessages]);

  // Load more messages when scrolling up
  const handleLoadMore = useCallback(() => {
    if (hasMorePages && !loadingMore) {
      fetchMessages(page + 1, true);
    }
  }, [fetchMessages, hasMorePages, loadingMore, page]);

  // Navigate back
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Open chat info screen
  const handleInfoPress = useCallback(() => {
    navigation.navigate('ChatInfo', { chatId : chatId });
  }, [navigation, chatId]);

  // Handle message sent - add optimistic update
  const handleMessageSent = useCallback((newMessage) => {
    // If we have details of the sent message, add it to the state optimistically
    if (newMessage) {
      // Add the new message to the top of the list (since FlatList is inverted)
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setShouldScrollToBottom(true);
    } else {
      // Fallback to fetching if no message details
      fetchMessages(1, false);
    }
  }, [fetchMessages]);

  // Set replying message
  const handleReply = useCallback((message) => {
    setReplyingTo(message);
  }, []);

  // Cancel replying
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Retry loading on error
  const handleRetry = useCallback(() => {
    setError(null);
    fetchChatDetails();
    fetchMessages();
  }, [fetchChatDetails, fetchMessages]);

  // Show loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ChatHeader
          chatData={null}
          onBackPress={handleBackPress}
          onInfoPress={handleInfoPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ChatHeader
          chatData={null}
          onBackPress={handleBackPress}
          onInfoPress={handleInfoPress}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <Button
            mode="contained"
            onPress={handleRetry}
            style={styles.retryButton}
            buttonColor={colors.accentColor}
          >
            Thử lại
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
    >
      <ChatHeader
        chatData={chatData}
        onBackPress={handleBackPress}
        onInfoPress={handleInfoPress}
      />

      {messageLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Message
              message={item}
              currentUserId={userData?.id}
              onLongPress={handleMessageLongPress}
            />
          )}
          inverted
          contentContainerStyle={[
            styles.messagesContainer,
            { paddingBottom: Platform.OS === 'android' ? 60 : 0 } // Add extra padding on Android
          ]}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.accentColor}
              style={styles.loadMoreIndicator}
            />
          ) : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
              </Text>
            </View>
          }
        />
      )}

      <MessageInput
        chatId={chatId}
        onMessageSent={handleMessageSent}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        userData={userData}
      />

      <Portal>
        <MessageActions
          visible={actionsVisible}
          onClose={() => setActionsVisible(false)}
          onReply={handleReply}
          onDelete={handleDeleteMessage}
          message={selectedMessage}
          isCurrentUser={selectedMessage?.sender?.id === userData?.id}
          position={messageActionPosition}
        />
      </Portal>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadMoreIndicator: {
    marginVertical: 10,
  }
});