import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Divider, List } from 'react-native-paper';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';
import { styles } from '../../../styles/style';
import { ProfileAvatar } from './components/ProfileAvatar';
import { ProfileHeader } from './components/ProfileHeader';

export const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { userData, loading, error, fetchUserData, updateAvatar, clearUserData } = useUser();

  const handleAvatarUpdate = (updatedData) => {
    const formData = new FormData();
    formData.append('avatar', updatedData);
    updateAvatar(formData);
  };
  
  // Handle logout
  const handleLogout = async () => {
    await clearUserData(); // Xóa dữ liệu user trước
    signOut(); // Sau đó đăng xuất
  };

  useEffect(() => {
    if (!userData) {
      fetchUserData();
    }
  }, [userData]);

  // Render profile information
  const renderProfileInfo = () => {
    if (loading && !userData) {
      return (
        <View style={profileStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải thông tin...</Text>
        </View>
      );
    }

    if (error && !userData) {
      return (
        <View style={profileStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.dangerColor} />
          <Text style={{ color: colors.dangerColor, marginTop: 10 }}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchUserData}
            style={{ marginTop: 10, backgroundColor: colors.accentColor }}
          >
            Thử lại
          </Button>
        </View>
      );
    }

    const defaultProfileData = {
      username: 'user',
      first_name: 'Người',
      last_name: 'dùng',
      email: 'user@example.com',
      phone_number: '',
      avatar: null,
      role: 'renter',
      joined_date: new Date().toISOString(),
      address: '',
      ...userData,
    };

    return (
      <View style={profileStyles.profileContainer}>
        <ProfileAvatar
          profile={defaultProfileData}
          onAvatarUpdate={handleAvatarUpdate}
        />

        <View style={styles.actionsSection}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('PublicProfile', { username: userData.username })}
            style={[profileStyles.actionButton, { borderColor: colors.accentColor, width: '50%', alignSelf: 'center' }]}
            icon="account"
            labelStyle={{ color: colors.accentColor }}
          >
            Xem trang cá nhân
          </Button>
        </View>

        <View style={profileStyles.infoSection}>
          <List.Section>
            <List.Item
              title="Tên đăng nhập"
              description={defaultProfileData.username}
              left={props => <List.Icon {...props} icon="account" color={colors.accentColor} />}
              titleStyle={{ color: colors.textPrimary }}
              descriptionStyle={{ color: colors.textSecondary }}
            />
            <Divider style={{ backgroundColor: colors.borderColor }} />

            <List.Item
              title="Email"
              description={defaultProfileData.email}
              left={props => <List.Icon {...props} icon="email" color={colors.accentColor} />}
              titleStyle={{ color: colors.textPrimary }}
              descriptionStyle={{ color: colors.textSecondary }}
            />
            <Divider style={{ backgroundColor: colors.borderColor }} />

            <List.Item
              title="Số điện thoại"
              description={defaultProfileData.phone_number}
              left={props => <List.Icon {...props} icon="phone" color={colors.accentColor} />}
              titleStyle={{ color: colors.textPrimary }}
              descriptionStyle={{ color: colors.textSecondary }}
            />
            <Divider style={{ backgroundColor: colors.borderColor }} />

            <List.Item
              title="Địa chỉ"
              description={defaultProfileData.address}
              left={props => <List.Icon {...props} icon="home" color={colors.accentColor} />}
              titleStyle={{ color: colors.textPrimary }}
              descriptionStyle={{ color: colors.textSecondary }}
            />

            <List.Item
              title="Ngày tham gia"
              description={new Date(defaultProfileData.joined_date).toLocaleDateString('vi-VN')}
              left={props => <List.Icon {...props} icon="calendar" color={colors.accentColor} />}
              titleStyle={{ color: colors.textPrimary }}
              descriptionStyle={{ color: colors.textSecondary }}
            />
          </List.Section>
        </View>

        <View style={profileStyles.actionsSection}>
          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => navigation.navigate('EditProfile')}
            style={[profileStyles.actionButton, { borderColor: colors.accentColor }]}
            labelStyle={{ color: colors.accentColor }}
          >
            Cập nhật thông tin
          </Button>

          <Button
            mode="outlined"
            icon="cog"
            onPress={() => navigation.navigate('Settings')}
            style={[profileStyles.actionButton, { borderColor: colors.accentColor }]}
            labelStyle={{ color: colors.accentColor }}
          >
            Cài đặt
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ProfileHeader />

      <ScrollView style={{ flex: 1 }}>
        {renderProfileInfo()}
        <TouchableOpacity
          style={[profileStyles.logoutButton, { backgroundColor: colors.accentColor }]}
          onPress={handleLogout}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const profileStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileContainer: {
    padding: 20,
  },
  infoSection: {
    marginVertical: 10,
  },
  actionsSection: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    marginBottom: 10,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  }
});
