import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { AvatarChatBox } from './components/AvatarChatBox';

export const ChatListItem = ({ chat }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const navigateToChat = () => {
    navigation.navigate('Chat', { chatId: chat.id, chatName: chat.name });
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { borderBottomColor: colors.borderColor }]}
      onPress={navigateToChat}
    >
      <AvatarChatBox
        avatars={chat.avatars}
        size={55}
        borderColor={colors.backgroundSecondary}
        style={styles.avatar}
      />

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {chat.lastMessageTime}
          </Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={1}>
            {chat.isGroup && chat.lastMessageSender ? `${chat.lastMessageSender}: ` : ''}
            {chat.lastMessage}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.accentColor }]}>
              <Text style={styles.badgeText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 10,
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  time: {
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});