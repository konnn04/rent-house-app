import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../utils/Fetch';
import { formatDateToRelative } from '../../utils/Tools';

// Component hiển thị tin nhắn
const MessageItem = ({ message, isCurrentUser, onLongPress }) => {
  const { colors } = useTheme();
  
  // Kiểm tra nếu là tin nhắn hệ thống
  if (message.is_system_message) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={[styles.systemMessageText, { color: colors.textSecondary }]}>
          {message.content}
        </Text>
      </View>
    );
  }
  
  // Tin nhắn đã bị xóa
  if (message.is_removed) {
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        { backgroundColor: isCurrentUser ? colors.backgroundSecondary : colors.backgroundTertiary }
      ]}>
        <Text style={[styles.removedMessageText, { color: colors.textSecondary }]}>
          Tin nhắn đã bị xóa
        </Text>
      </View>
    );
  }
  
  return (
    <TouchableOpacity 
      style={[
        styles.messageWrapper,
        isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper
      ]}
      onLongPress={() => onLongPress && onLongPress(message)}
      activeOpacity={0.8}
    >
      {!isCurrentUser && (
        <Image 
          source={{ uri: message.sender.avatar_thumbnail }} 
          style={styles.messageAvatar} 
        />
      )}
      
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        { backgroundColor: isCurrentUser ? colors.accentColor : colors.backgroundTertiary }
      ]}>
        {!isCurrentUser && (
          <Text style={[styles.messageSender, { color: colors.textPrimary }]}>
            {message.sender.full_name}
          </Text>
        )}
        
        {message.replied_to_preview && (
          <View style={[styles.repliedMessageContainer, { backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : colors.backgroundSecondary }]}>
            <Text style={[styles.repliedMessageSender, { color: isCurrentUser ? 'white' : colors.accentColor }]}>
              {message.replied_to_preview.sender.full_name}
            </Text>
            <Text style={[styles.repliedMessageContent, { color: isCurrentUser ? 'white' : colors.textPrimary }]} numberOfLines={1}>
              {message.replied_to_preview.content}
            </Text>
          </View>
        )}
        
        <Text style={[
          styles.messageContent, 
          { color: isCurrentUser ? 'white' : colors.textPrimary }
        ]}>
          {message.content}
        </Text>
        
        <Text style={[
          styles.messageTime, 
          { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
        ]}>
          {formatDateToRelative(message.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Component Header cho chat
const ChatHeader = ({ chatData, onBackPress, onInfoPress }) => {
  const { colors } = useTheme();
  const { userData } = useUser();
  
  const getDisplayName = () => {
    if (!chatData) return 'Chat';
    
    if (chatData.is_group && chatData.name) {
      return chatData.name;
    }
    
    // Cho chat 1-1, hiển thị tên người dùng khác
    const otherMember = chatData.members_summary?.find(m => m.id !== userData?.id);
    return otherMember?.full_name || 'Chat';
  };
  
  const getSubtitle = () => {
    if (!chatData) return '';
    
    if (chatData.is_group) {
      return `${chatData.members?.length || 0} thành viên`;
    }
    
    // Có thể hiển thị trạng thái online hoặc thông tin khác cho chat 1-1
    return '';
  };
  
  return (
    <View style={[styles.header, { backgroundColor: colors.backgroundPrimary }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackPress}
      >
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {getDisplayName()}
        </Text>
        {getSubtitle() ? (
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {getSubtitle()}
          </Text>
        ) : null}
      </View>
      
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onInfoPress}
      >
        <Icon name="information-outline" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

// Component nhập tin nhắn
const MessageInput = ({ onSend, sending, replyingTo, onCancelReply }) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (!message.trim() || sending) return;
    
    onSend(message);
    setMessage('');
  };
  
  return (
    <View style={[styles.inputContainer, { backgroundColor: colors.backgroundPrimary }]}>
      {replyingTo && (
        <View style={[styles.replyPreview, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.replyPreviewContent}>
            <Text style={[styles.replyPreviewName, { color: colors.accentColor }]}>
              {replyingTo.sender.full_name}
            </Text>
            <Text style={[styles.replyPreviewText, { color: colors.textPrimary }]} numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <Icon name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { backgroundColor: message.trim() && !sending ? colors.accentColor : colors.disabledColor }
          ]}
          onPress={handleSend}
          disabled={!message.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Icon name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Component chính ChatDetail
export const ChatDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { userData } = useUser();
  const flatListRef = useRef(null);
  
  const chatId = route.params?.chatId;
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Fetch chat details
  const fetchChatData = useCallback(async () => {
    try {
      if (!chatId) {
        setError('Chat ID không hợp lệ');
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
      
      const response = await api.get(`/messages/?chat_id=${chatId}&page=${pageNum}&page_size=20`);
      
      if (response.data.results) {
        if (loadMore) {
          setMessages(prev => [...prev, ...response.data.results]);
        } else {
          setMessages(response.data.results);
        }
        
        setHasMore(!!response.data.next);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessageLoading(false);
      setLoadingMore(false);
    }
  }, [chatId]);
  
  // Initial load
  useEffect(() => {
    fetchChatData();
    fetchMessages();
  }, [fetchChatData, fetchMessages]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchChatData();
    fetchMessages(1, false);
  }, [fetchChatData, fetchMessages]);
  
  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  }, [hasMore, loadingMore, page, fetchMessages]);
  
  // Handle send message
  const handleSendMessage = async (messageText) => {
    try {
      setSending(true);
      
      const formData = new FormData();
      formData.append('chat_group', chatId);
      formData.append('content', messageText);
      
      if (replyingTo) {
        formData.append('replied_to', replyingTo.id);
      }
      
      await api.post('/messages/', formData);
      
      // Clear reply
      setReplyingTo(null);
      
      // Refresh messages after sending
      fetchMessages();
      
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setSending(false);
    }
  };
  
  // Handle message long press
  const handleMessageLongPress = (message) => {
    // Hiển thị menu tùy chọn: Reply, Copy, Delete...
    setReplyingTo(message);
  };
  
  // Cancel replying
  const handleCancelReply = () => {
    setReplyingTo(null);
  };
  
  // Handle navigation
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  const handleInfoPress = () => {
    navigation.navigate('ChatInfo', { chatId: chatId });
  };
  
  // Render methods
  const renderItem = ({ item }) => (
    <MessageItem 
      message={item} 
      isCurrentUser={item.sender?.id === userData?.id}
      onLongPress={handleMessageLongPress}
    />
  );
  
  const renderEmptyMessages = () => (
    <View style={styles.emptyMessagesContainer}>
      <Icon name="chat-outline" size={50} color={colors.textSecondary} />
      <Text style={[styles.emptyMessagesText, { color: colors.textSecondary }]}>
        Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
      </Text>
    </View>
  );
  
  // Main render
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
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
            onPress={fetchChatData}
          >
            <Text style={{ color: 'white' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ChatHeader 
        chatData={chatData}
        onBackPress={handleBackPress}
        onInfoPress={handleInfoPress}
      />
      
      {messageLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.messagesContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.accentColor]}
              tintColor={colors.accentColor}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={colors.accentColor} />
            </View>
          ) : null}
          ListEmptyComponent={renderEmptyMessages}
        />
      )}
      
      <MessageInput 
        onSend={handleSendMessage}
        sending={sending}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  backButton: {
    padding: 5,
  },
  headerButton: {
    padding: 5,
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  currentUserWrapper: {
    justifyContent: 'flex-end',
  },
  otherUserWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 16,
  },
  currentUserMessage: {
    borderTopRightRadius: 4,
    marginLeft: 40,
  },
  otherUserMessage: {
    borderTopLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  repliedMessageContainer: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0,0,0,0.2)',
    paddingLeft: 8,
    marginBottom: 8,
    padding: 4,
    borderRadius: 4,
  },
  repliedMessageSender: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  repliedMessageContent: {
    fontSize: 12,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemMessageText: {
    fontSize: 12,
    fontStyle: 'italic',
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  removedMessageText: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 8,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewName: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  replyPreviewText: {
    fontSize: 12,
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
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  loadingMoreContainer: {
    padding: 10,
    alignItems: 'center',
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyMessagesText: {
    textAlign: 'center',
    marginTop: 10,
  },
});