import { View } from 'react-native';
import { ChatListScreen } from './ChatListScreen';

export const ChatScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <ChatListScreen />
    </View>
  );
};