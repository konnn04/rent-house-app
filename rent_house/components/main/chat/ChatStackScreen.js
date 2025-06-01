import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getChatDetailsFromRoute } from '../../../utils/ChatUtils';

const ChatScreenStack = createNativeStackNavigator();

import { ChatDetailScreen } from "./ChatDetailScreen";
import { ChatInfoScreen } from './ChatInfoScreen';

export const ChatStackScreen = () => {
    const route = useRoute();
    const { chatId, chatName, userId } = getChatDetailsFromRoute(route);
    
    return (
        <ChatScreenStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <ChatScreenStack.Screen 
                name="ChatDetail" 
                component={ChatDetailScreen} 
                initialParams={{ chatId, chatName, userId }} 
            />
            <ChatScreenStack.Screen name="ChatInfo" component={ChatInfoScreen} />
        </ChatScreenStack.Navigator>
    );
}