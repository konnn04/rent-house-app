import { createStackNavigator } from '@react-navigation/stack';
import { styles } from '../../styles/style';
import { Lookup } from './Lookup';
import { HouseDetail } from '../houses/HouseDetail'

const Stack = createStackNavigator();

export const LookupStackScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: styles.cardStyle,
        presentation: 'card',
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Lookup" component={Lookup} />
      <Stack.Screen name="HouseDetail" component={HouseDetail} />
    </Stack.Navigator>
  );
};