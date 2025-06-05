import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { FeedList } from './FeedList';
import { SearchScreen } from './SearchScreen';

const FeedStack = createStackNavigator();

export const FeedScreen = () => {
  return (
    <FeedStack.Navigator initialRouteName="FeedList" screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedList" component={FeedList} />
      <FeedStack.Screen name="SearchScreen" component={SearchScreen} />
    </FeedStack.Navigator>
  );
};