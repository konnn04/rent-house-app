import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotificationCount } from '../../../contexts/NotificationCountContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';
import { getChatsService } from "../../../services/chatService";
import { homeStyles } from '../../../styles/style';
import { timeAgo } from '../../../utils/Tools';
import { ChatListItem } from './ChatListItem';
import { SearchBar } from './components/SearchBar';

export const ChatListScreen = () => {
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [error, setError] = useState(null);
  const { userData } = useUser();
  const navigation = useNavigation();
  const { resetMessageCount, fetchUnreadMessages } = useNotificationCount();
  const isFocused = useIsFocused();

  const fetchChats = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else if (nextPageUrl && !isRefresh) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let data;
      if (!isRefresh && nextPageUrl) {
        data = await getChatsService(nextPageUrl);
      } else {
        data = await getChatsService();
      }

      setNextPageUrl(data.next || null);

      const results = Array.isArray(data.results) ? data.results : [];

      if (isRefresh) {
        setChats(results);
      } else {
        setChats(prev => [...prev, ...results]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Không thể tải danh sách chat. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [nextPageUrl]);

  useEffect(() => {
    fetchChats(true);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChats(true);
    });
    return unsubscribe;
  }, [navigation, fetchChats]);

  useEffect(() => {
    if (isFocused) {
      resetMessageCount();
    }
  }, [isFocused, resetMessageCount]);

  const onRefresh = useCallback(() => {
    setNextPageUrl(null);
    fetchChats(true);
    resetMessageCount();
  }, [fetchChats, resetMessageCount]);

  const handleLoadMore = () => {
    if (loadingMore || !nextPageUrl) return;
    fetchChats(false);
  };

  const getAvatars = useCallback((members, isGroup) => {
    if (isGroup) {
      return members.map((member) => member.avatar_thumbnail);
    }
    return members[0]?.username !== userData?.username
      ? [members[0].avatar_thumbnail]
      : [members[1].avatar_thumbnail];
  }, [userData?.username]);

  const filteredChats = chats.filter(chat => {
    if (!chat.last_message) return false;

    if (chat.is_group && chat.name) {
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return chat.members_summary.some(member => 
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getChatDisplayName = useCallback((chat) => {
    if (chat.is_group && chat.name) {
      return chat.name;
    }
    return chat.members_summary[0]?.username != userData?.username
      ? chat.members_summary[0].full_name
      : chat.members_summary[1].full_name;
  }, [userData?.username]);

  const renderItem = useCallback(
    ({ item }) => (
      <ChatListItem
        key={item.id}
        chat={{
          id: item.id,
          name: getChatDisplayName(item),
          avatars: getAvatars(item.members_summary, item.is_group),
          lastMessage: item.last_message?.content || 'Chưa có tin nhắn',
          lastMessageTime: item.last_message ? timeAgo(item.last_message.created_at) : '',
          unreadCount: item.unread_count || 0,
          isGroup: item.is_group,
          lastMessageSender: item.last_message?.sender?.full_name || ''
        }} 
      />
    ),
    [getAvatars, getChatDisplayName]
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải danh sách chat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.dangerColor, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
          onPress={() => fetchChats(true)}
        >
          <Text style={{ color: 'white' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={[homeStyles.title, { color: colors.textPrimary, padding: 10 }]}>Trò chuyện</Text>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FlatList
        data={filteredChats}
        keyExtractor={item => "chatbox-" + item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accentColor]}
            tintColor={colors.accentColor}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 10, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.accentColor} />
              <Text style={{ color: colors.textSecondary, marginTop: 5 }}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Chưa có cuộc trò chuyện nào. Hãy bắt đầu một cuộc trò chuyện mới!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  }
});