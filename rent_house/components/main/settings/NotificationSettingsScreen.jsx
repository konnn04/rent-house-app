import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, List, Switch } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';

export const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const [notifications, setNotifications] = useState({
    messages: true,
    newPosts: true,
    promotions: false,
    appUpdates: true,
  });
  
  const toggleNotification = async (key) => {
    try {
      const newSettings = {
        ...notifications,
        [key]: !notifications[key]
      };
      
      setNotifications(newSettings);
      
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={[styles.header, { backgroundColor: colors.accentColorLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cài đặt thông báo</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <List.Item
          title="Tin nhắn mới"
          description="Nhận thông báo khi có tin nhắn mới"
          left={props => <List.Icon {...props} icon="message" color={colors.accentColor} />}
          right={() => (
            <Switch
              value={notifications.messages}
              onValueChange={() => toggleNotification('messages')}
              color={colors.accentColor}
            />
          )}
          titleStyle={{ color: colors.textPrimary }}
          descriptionStyle={{ color: colors.textSecondary }}
        />
        
        <Divider style={{ backgroundColor: colors.borderColor }} />
        
        <List.Item
          title="Tin đăng mới"
          description="Nhận thông báo khi có tin đăng mới phù hợp"
          left={props => <List.Icon {...props} icon="home" color={colors.accentColor} />}
          right={() => (
            <Switch
              value={notifications.newPosts}
              onValueChange={() => toggleNotification('newPosts')}
              color={colors.accentColor}
            />
          )}
          titleStyle={{ color: colors.textPrimary }}
          descriptionStyle={{ color: colors.textSecondary }}
        />
        
        <Divider style={{ backgroundColor: colors.borderColor }} />
        
        <List.Item
          title="Khuyến mãi"
          description="Nhận thông báo về các chương trình khuyến mãi"
          left={props => <List.Icon {...props} icon="tag" color={colors.accentColor} />}
          right={() => (
            <Switch
              value={notifications.promotions}
              onValueChange={() => toggleNotification('promotions')}
              color={colors.accentColor}
            />
          )}
          titleStyle={{ color: colors.textPrimary }}
          descriptionStyle={{ color: colors.textSecondary }}
        />
        
        <Divider style={{ backgroundColor: colors.borderColor }} />
        
        <List.Item
          title="Cập nhật ứng dụng"
          description="Nhận thông báo khi có bản cập nhật mới"
          left={props => <List.Icon {...props} icon="update" color={colors.accentColor} />}
          right={() => (
            <Switch
              value={notifications.appUpdates}
              onValueChange={() => toggleNotification('appUpdates')}
              color={colors.accentColor}
            />
          )}
          titleStyle={{ color: colors.textPrimary }}
          descriptionStyle={{ color: colors.textSecondary }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
});
