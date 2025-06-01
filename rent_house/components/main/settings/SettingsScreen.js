import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, List, Switch, Text } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';

export const SettingsScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cài đặt</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <List.Section>
          <List.Subheader style={{ color: colors.textSecondary }}>Giao diện</List.Subheader>
          
          <List.Item
            title="Chế độ tối"
            left={props => <List.Icon {...props} icon={theme === 'dark' ? 'moon' : 'white-balance-sunny'} color={colors.accentColor} />}
            right={() => (
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                color={colors.accentColor}
              />
            )}
            titleStyle={{ color: colors.textPrimary }}
          />
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <List.Subheader style={{ color: colors.textSecondary }}>Tài khoản & Bảo mật</List.Subheader>
          
          <List.Item
            title="Thông tin cá nhân"
            left={props => <List.Icon {...props} icon="account-edit" color={colors.accentColor} />}
            right={() => <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
            onPress={() => navigation.navigate('EditProfile', { profile: navigation.getState().routes[0].params?.profile })}
            titleStyle={{ color: colors.textPrimary }}
          />
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <List.Item
            title="Đổi mật khẩu"
            left={props => <List.Icon {...props} icon="lock" color={colors.accentColor} />}
            right={() => <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
            onPress={() => navigation.navigate('ChangePassword')}
            titleStyle={{ color: colors.textPrimary }}
          />
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <List.Subheader style={{ color: colors.textSecondary }}>Thông báo</List.Subheader>
          
          <List.Item
            title="Cài đặt thông báo"
            left={props => <List.Icon {...props} icon="bell" color={colors.accentColor} />}
            right={() => <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
            onPress={() => navigation.navigate('NotificationSettings')}
            titleStyle={{ color: colors.textPrimary }}
          />
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <List.Subheader style={{ color: colors.textSecondary }}>Khác</List.Subheader>
          
          <List.Item
            title="Ngôn ngữ"
            description="Tiếng Việt"
            left={props => <List.Icon {...props} icon="translate" color={colors.accentColor} />}
            right={() => <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
            onPress={() => navigation.navigate('LanguageSettings')}
            titleStyle={{ color: colors.textPrimary }}
            descriptionStyle={{ color: colors.textSecondary }}
          />
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <List.Item
            title="Thông tin ứng dụng"
            onPress={() => navigation.navigate('AboutApp')}
            description="Phiên bản 1.0.0"
            left={props => <List.Icon {...props} icon="information" color={colors.accentColor} />}
            right={() => <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
            titleStyle={{ color: colors.textPrimary }}
            descriptionStyle={{ color: colors.textSecondary }}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  },
});
