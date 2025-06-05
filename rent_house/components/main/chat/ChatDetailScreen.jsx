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
import {
  deleteMessageService,
  editMessageService,
  getChatContentService,
  getInfoChatService
} from "../../../services/chatService";
import { getChatDetailsFromRoute } from '../../../utils/ChatUtils';

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

  const { chatId } = getChatDetailsFromRoute(route);

  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messagesNextUrl, setMessagesNextUrl] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);

  const [actionsVisible, setActionsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageActionPosition, setMessageActionPosition] = useState({ x: 0, y: 0 });

  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);


  const fetchChatDetails = useCallback(async () => {
    try {
      if (!chatId) {
        setError('Không tìm thấy ID cuộc trò chuyện');
        setLoading(false);
        return;
      }

      setError(null);
      if (!refreshing) setLoading(true);

      const chatInfo = await getInfoChatService(chatId);
      setChatData(chatInfo);

    } catch (err) {
      console.error('Error fetching chat data:', err);
      setError('Không thể tải thông tin chat. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatId, refreshing]);

  const fetchMessages = useCallback(async (isRefresh = false) => {
    if (!chatId) return;
    try {
      if (isRefresh) {
        setMessageLoading(true);
      } else {
        setLoadingMore(true);
      }
      let data;
      if (!isRefresh && messagesNextUrl) {
        data = await getChatContentService(chatId, messagesNextUrl);
      } else {
        data = await getChatContentService(chatId);
      }
      setMessagesNextUrl(data.next || null);
      const results = Array.isArray(data.results) ? data.results : [];
      if (isRefresh) {
        setMessages(results);
      } else {
        setMessages(prev => [...prev, ...results]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (isRefresh) setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setMessageLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [chatId, messagesNextUrl]);

  useEffect(() => {
    if (shouldScrollToBottom && flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    fetchChatDetails();
    fetchMessages(true);
  }, [fetchChatDetails]);

  const handleMessageLongPress = (message, event) => {
    setSelectedMessage(message);
    
    const { pageX, pageY } = event.nativeEvent;
    setMessageActionPosition({ x: pageX, y: pageY });
    
    setActionsVisible(true);
  };

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
                await deleteMessageService(message.id);
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === message.id ? { ...msg, is_removed: true } : msg
                  )
                );
              } catch (error) {
                let msg = 'Không thể xóa tin nhắn. Vui lòng thử lại sau.';
                if (error.response?.data?.error) msg = error.response.data.error;
                Alert.alert('Lỗi', msg);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error showing delete alert:', error);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const updated = await editMessageService(messageId, { content: newContent });
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, ...updated } : msg
        )
      );
      return { success: true };
    } catch (error) {
      let msg = 'Không thể sửa tin nhắn. Vui lòng thử lại sau.';
      if (error.response?.data?.error) msg = error.response.data.error;
      return { success: false, error: msg };
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setMessagesNextUrl(null);
    fetchChatDetails();
    fetchMessages(true);
  }, [fetchChatDetails, fetchMessages]);

  const handleLoadMore = useCallback(() => {
    if (messagesNextUrl && !loadingMore) {
      fetchMessages(false);
    }
  }, [fetchMessages, messagesNextUrl, loadingMore]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleInfoPress = useCallback(() => {
    navigation.navigate('ChatInfo', { chatId : chatId });
  }, [navigation, chatId]);

  const handleMessageSent = useCallback((newMessage) => {
    if (newMessage) {
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setShouldScrollToBottom(true);
    } else {
      fetchMessages(1, false);
    }
  }, [fetchMessages]);

  const handleReply = useCallback((message) => {
    setReplyingTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    fetchChatDetails();
    fetchMessages();
  }, [fetchChatDetails, fetchMessages]);

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
              onEdit={handleEditMessage}
            />
          )}
          inverted
          contentContainerStyle={[
            styles.messagesContainer,
            { paddingBottom: Platform.OS === 'android' ? 60 : 0 }
          ]}
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
          onEdit={handleEditMessage}
          message={selectedMessage}
          isCurrentUser={selectedMessage?.sender?.id === userData?.id}
          position={messageActionPosition}
        />
      </Portal>
    </KeyboardAvoidingView>
  );
};

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