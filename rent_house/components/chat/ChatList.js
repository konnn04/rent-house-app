import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { homeStyles } from '../../styles/style';
import { api } from '../../utils/Fetch';
import { formatDateToRelative } from '../../utils/Tools';
import { ChatBox } from './ChatBox';
import { SearchBar } from './SearchBar';

export const ChatList = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchChats = useCallback(async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);
      
      const response = await api.get('/api/chats/');
      
      if (response.status === 200) {
        setChats(response.data.results || []);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Không thể tải danh sách chat. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, [fetchChats]);

  // Lọc danh sách chat theo từ khóa tìm kiếm
  const filteredChats = chats.filter(chat => {
    // Với nhóm chat, tìm theo tên nhóm
    if (chat.is_group && chat.name) {
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // Với chat 1-1, tìm theo tên thành viên
    return chat.members_summary.some(member => 
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Lấy tên hiển thị cho chat
  const getChatDisplayName = (chat) => {
    if (chat.is_group && chat.name) {
      return chat.name;
    }
    // Trường hợp chat 1-1, hiển thị tên của người kia
    return chat.members_summary
      .map(member => member.full_name)
      .join(', ');
  };

  // Lấy avatar cho chat
  const getChatAvatar = (chat) => {
    if (chat.is_group) {
      // Với nhóm, có thể trả về avatar đại diện nhóm hoặc avatar thành viên đầu tiên
      return chat.members_summary[0]?.avatar_thumbnail || null;
    }
    // Với chat 1-1, lấy avatar của người kia
    return chat.members_summary[0]?.avatar_thumbnail || null;
  };

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
          onPress={fetchChats}
        >
          <Text style={{ color: 'white' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={[homeStyles.title, { color: colors.textPrimary, padding: 10 }]}>RENT HOUSE Chat</Text>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ChatBox 
            chat={{
              id: item.id,
              name: getChatDisplayName(item),
              avatar: getChatAvatar(item),
              lastMessage: item.last_message?.content || 'Chưa có tin nhắn',
              lastMessageTime: item.last_message ? formatDateToRelative(item.last_message.created_at) : '',
              unreadCount: item.unread_count || 0,
              isGroup: item.is_group,
              lastMessageSender: item.last_message?.sender?.full_name || ''
            }} 
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accentColor]}
            tintColor={colors.accentColor}
          />
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