import { createStackNavigator } from '@react-navigation/stack';
import { styles } from "../../styles/style";
import { PublicProfile } from '../profiles/PublicProfile';
import { FeedList } from './FeedList';

const Stack = createStackNavigator();

export const FeedStackScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: styles.cardStyle,
        presentation: 'card',
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="FeedsList" component={FeedList} />
      <Stack.Screen name="PublicProfile" component={PublicProfile} />
    </Stack.Navigator>
  );
};