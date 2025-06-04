import { createNativeStackNavigator } from '@react-navigation/native-stack';

const SettingStackScreen = createNativeStackNavigator();

import { ChangePasswordScreen } from "../profiles/ChangePasswordScreen";
import { EditProfileScreen } from "../profiles/EditProfileScreen";
import { AboutAppScreen } from './AboutAppScreen';
import { LanguageSettingsScreen } from './LanguageSettingsScreen';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';
import { SettingsScreen } from './SettingsScreen';


export const SettingScreenStack = () => {
    return (
        <SettingStackScreen.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <SettingStackScreen.Screen name="SettingsScreen" component={SettingsScreen} />
            <SettingStackScreen.Screen name="AboutApp" component={AboutAppScreen} />
            <SettingStackScreen.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <SettingStackScreen.Screen name="EditProfile" component={EditProfileScreen} />
            <SettingStackScreen.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <SettingStackScreen.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
        </SettingStackScreen.Navigator>
    );
}