import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { useTheme } from '../../../../contexts/ThemeContext';
import { ImageGallery } from '../../../common/ImageGallery';

export const Message = ({ message, currentUserId, onLongPress }) => {
  const { colors } = useTheme();
  const isCurrentUser = message.sender.id === currentUserId;
  const screenWidth = Dimensions.get('window').width;
  const maxMessageWidth = screenWidth * 0.75; // 75% of screen width
  
  // Handle system messages
  if (message.is_system_message) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={[styles.systemMessageText, { color: colors.textSecondary }]}>
          {message.content}
        </Text>
      </View>
    );
  }
  
  // Handle deleted messages
  if (message.is_removed) {
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        { backgroundColor: isCurrentUser ? colors.backgroundSecondary : colors.backgroundTertiary }
      ]}>
        <Text style={[styles.deletedMessageText, { color: colors.textSecondary }]}>
          Tin nhắn đã bị xóa
        </Text>
      </View>
    );
  }
  
  const handleLongPress = (event) => {
    if (onLongPress) {
      onLongPress(message, event);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.messageWrapper,
        isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper
      ]}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      delayLongPress={200}
    >
      {!isCurrentUser && (
        <Image 
          source={{ uri: message.sender.avatar_thumbnail || 'https://via.placeholder.com/40' }} 
          style={styles.messageAvatar} 
        />
      )}
      
      <Card 
        style={[
          styles.messageCard,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          { backgroundColor: isCurrentUser ? colors.accentColor : colors.backgroundSecondary }
        ]}
      >
        <Card.Content style={styles.messageContent}>
          {!isCurrentUser && (
            <Text style={[styles.messageSender, { color: colors.textSecondary }]}>
              {message.sender.full_name}
            </Text>
          )}
          
          {message.replied_to_preview && (
            <View style={[styles.replyPreview, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.replyName, { color: colors.textSecondary }]}>
                {message.replied_to_preview.sender.full_name}
              </Text>
              <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 3 }} />
              <Text 
                style={[styles.replyContent, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {message.replied_to_preview.content}
              </Text>
            </View>
          )}
          
          {message.content && (
            <Text style={[
              styles.messageText, 
              { color: isCurrentUser ? 'white' : colors.textPrimary }
            ]}>
              {message.content}
            </Text>
          )}
          
          {message.media && message.media.length > 0 && (
            <View style={styles.mediaContainer}>
              <ImageGallery 
                mediaItems={message.media} 
                containerWidth={maxMessageWidth - 40} // Account for padding
              />
            </View>
          )}
          
          <Text style={[styles.messageTime, { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    maxWidth: '75%',
  },
  currentUserWrapper: {
    alignSelf: 'flex-end',
  },
  otherUserWrapper: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  messageCard: {
    borderRadius: 15,
    padding: 0,
    maxWidth: '100%',
  },
  messageContent: {
    padding: 8,
  },
  currentUserMessage: {
    borderBottomRightRadius: 5,
  },
  otherUserMessage: {
    borderBottomLeftRadius: 5,
  },
  messageSender: {
    fontSize: 12,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  deletedMessageText: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    fontSize: 13,
    fontStyle: 'italic',
    padding: 5,
    borderRadius: 10,
  },
  replyPreview: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(0,0,0,0.2)',
  },
  replyName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  replyContent: {
    fontSize: 12,
  },
  mediaContainer: {
    marginTop: 5,
    width: '100%',
  }
});
