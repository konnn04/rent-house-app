import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const MainStackScreen = createNativeStackNavigator();

import { TabScreens } from './TabScreens';
import { ChatStackScreen } from './chat/ChatStackScreen';
import { HouseDetailScreen } from "./houses/detail/HouseDetailScreen";
import { CreatePostScreen } from './posts/CreatePostScreen';
import { EditProfileScreen } from "./profiles/EditProfileScreen";
import { PublicProfile } from "./profiles/PublicProfile";
import { SettingScreenStack } from './settings/SettingScreenStack';
// Import our new screens
import { AddEditRoomScreen } from './houses/manage/AddEditRoomScreen';
import { IdentityVerificationScreen } from './houses/manage/IdentityVerificationScreen';
import { RoomDetailScreen } from './houses/manage/RoomDetailScreen';
import { RoomListScreen } from './houses/manage/RoomListScreen';


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
                {/* Room Management Screens */}
                <MainStackScreen.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
                <MainStackScreen.Screen name="RoomList" component={RoomListScreen} />
                <MainStackScreen.Screen name="AddEditRoom" component={AddEditRoomScreen} />
                <MainStackScreen.Screen name="RoomDetail" component={RoomDetailScreen} />


            </MainStackScreen.Navigator>
        </SafeAreaProvider>
    );
}