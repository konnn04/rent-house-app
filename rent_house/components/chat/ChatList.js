import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ChatBox from './ChatBox';
import SearchBar from './SearchBar';
import { homeStyles } from '../../styles/style';


const mockChats = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessage: 'Hey, how are you?',
    lastMessageTime: '10:00 AM',
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: 'Let’s catch up later!',
    lastMessageTime: '10:15 AM',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastMessage: 'Sure, see you soon!',
    lastMessageTime: '10:30 AM',
  },
];

const ChatList = () => {
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={[homeStyles.title, { color: colors.textPrimary, padding: 10}]}>RENT HOUSE chat</Text>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatBox chat={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default ChatList;