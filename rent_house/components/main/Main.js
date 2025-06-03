import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const MainStackScreen = createNativeStackNavigator();

import { TabScreens } from './TabScreens';
import { ChatStackScreen } from './chat/ChatStackScreen';
import { HouseDetailScreen } from "./houses/detail/HouseDetailScreen";
import { AddEditHouseScreen } from './houses/manage/AddEditHouseScreen';
import { EditHouseScreen } from './houses/manage/EditHouseScreen';
import { IdentityVerificationScreen } from './houses/manage/IdentityVerificationScreen';
import { CreatePostScreen } from './posts/CreatePostScreen';
import { EditProfileScreen } from "./profiles/EditProfileScreen";
import { PublicProfile } from "./profiles/PublicProfile";
import { SettingScreenStack } from './settings/SettingScreenStack';

export const Main = () => {
    return (
        <SafeAreaProvider>
            <MainStackScreen.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <MainStackScreen.Screen name="MainTab" component={TabScreens} />
                {/* Public Profile Screen */}
                <MainStackScreen.Screen name="PublicProfile" component={PublicProfile} />
                {/* Chat */}
                <MainStackScreen.Screen name="Chat" component={ChatStackScreen} />
                {/* Settings */}
                <MainStackScreen.Screen name="Settings" component={SettingScreenStack} />
                {/* Profile  */}
                <MainStackScreen.Screen name="EditProfile" component={EditProfileScreen} />
                {/* Create Post */}
                <MainStackScreen.Screen name="CreatePost" component={CreatePostScreen} />
                {/* House Detail */}
                <MainStackScreen.Screen name="HouseDetail" component={HouseDetailScreen} />
                {/* House Management */}
                <MainStackScreen.Screen name="AddHouse" component={AddEditHouseScreen} />
                <MainStackScreen.Screen name="EditHouse" component={EditHouseScreen} />
                {/* Identity Verification */}
                <MainStackScreen.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
            </MainStackScreen.Navigator>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});