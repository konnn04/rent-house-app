import React from 'react';
import { style } from 'react-native';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const ChatBox = ({ chat }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={chatStyles.chatBox}>
      <Image source={{ uri: chat.avatar }} style={chatStyles.avatar} />
      <View style={chatStyles.chatInfo}>
        <Text style={[chatStyles.chatName, {color: colors.textPrimary}]}>{chat.name}</Text>
        <Text style={[chatStyles.chatLastMessage, {color: colors.textSecondary}]}>{chat.lastMessage}</Text>
      </View>
      <Text style={[chatStyles.chatTime,{color: colors.textSecondary}]}>{chat.lastMessageTime}</Text>
    </TouchableOpacity>
  );
};

const chatStyles = StyleSheet.create({
  chatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  chatLastMessage: {
    color: '#555',
    fontSize: 14,
  },
  chatTime: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default ChatBox;