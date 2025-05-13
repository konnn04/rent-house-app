import { createStackNavigator } from '@react-navigation/stack';
import { styles } from "../../styles/style";
import { ChatBox } from './ChatBox';
import { ChatDetail } from "./ChatDetail";
import { ChatList } from './ChatList';

const Stack = createStackNavigator();

export const ChatStackScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: styles.cardStyle,
        presentation: 'card',
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="ChatList" component={ChatList} />
      <Stack.Screen name="ChatBox" component={ChatBox} />
      <Stack.Screen name="ChatDetail" component={ChatDetail} />
    </Stack.Navigator>
  );
};