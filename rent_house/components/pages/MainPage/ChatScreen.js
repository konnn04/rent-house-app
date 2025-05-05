import React from 'react';
import { View, Text } from 'react-native';
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

  return (<View style={styles.container}></View>);
}




  export default ChatScreen;