import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../../../styles/style';

const chatBoxInfo = {
  user1: {
    id: 'user1',
    name: 'User 1',
    avatar: 'https://example.com/avatar1.jpg',
    lastMessage: 'Hello!',
    lastMessageTime: '10:00 AM',
  },
  user2: {
    id: 'user2',
    name: 'User 2',
    avatar: 'https://example.com/avatar2.jpg',
    lastMessage: 'Hi!',
    lastMessageTime: '10:05 AM',
  },
}

const messageHistory = [
  {
    id: '1',
    sender: 'user1',
    receiver: 'user2',
    message: 'Hello!',
    timestamp: '2023-10-01T10:00:00Z',
  },
  {
    id: '2',
    sender: 'user2',
    receiver: 'user1',
    message: 'Hi!',
    timestamp: '2023-10-01T10:05:00Z',
  },
  // Add more messages as needed
];

const ChatScreen = () => {

  return (<View style={styles.container}>
    <View style={styles.chatBox}>
      <Text style={styles.chatBoxName}>{chatBoxInfo.user1.name}</Text>
      <Text style={styles.chatBoxLastMessage}>{chatBoxInfo.user1.lastMessage}</Text>
      <Text style={styles.chatBoxLastMessageTime}>{chatBoxInfo.user1.lastMessageTime}</Text>
    </View>

    <View style={styles.messageHistory}>
      {messageHistory.map((message) => (
        <View key={message.id} style={styles.message}>
          <Text style={styles.messageSender}>{message.sender}</Text>
          <Text style={styles.messageContent}>{message.message}</Text>
          <Text style={styles.messageTimestamp}>{new Date(message.timestamp).toLocaleTimeString()}</Text>
        </View>
      ))}
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.inputPlaceholder}>Type a message...</Text>
      <View style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send</Text>
      </View>
    </View>
  </View>);
}




  export default ChatScreen;