import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';

export const ProfileAvatar = ({ profile, onAvatarUpdate }) => {
  const { colors } = useTheme();
  const { loading } = useUser();
  const [avatarLoading, setAvatarLoading] = useState(false);

  const roles = {
    renter: 'Người thuê',
    owner: 'Chủ nhà',
    admin: 'Quản trị viên',
    moderator: 'Người điều hành',
    collaborator: 'Cộng tác viên',
  }
  
  const handleUpdateAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để thay đổi avatar');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        setAvatarLoading(true);
        
        if (onAvatarUpdate) {
          onAvatarUpdate({
            uri: imageUri,
            type: type,
            name: filename
          });
        }
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật avatar. Vui lòng thử lại sau.');
    } finally {
      setAvatarLoading(false);
    }
  };
  
  return (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        <Avatar.Image 
          size={100} 
          source={profile?.avatar ? 
            { uri: profile.avatar } : 
            require('@assets/images/adaptive-icon.png')
          } 
          style={styles.avatar}
        />
        {(avatarLoading || loading) && (
          <View style={styles.avatarLoadingOverlay}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.editAvatarButton}
        onPress={handleUpdateAvatar}
        disabled={avatarLoading || loading}
      >
        <Ionicons name="camera" size={20} color={colors.backgroundPrimary} />
      </TouchableOpacity>
      <Text style={[styles.userName, { color: colors.textPrimary }]}>
        {profile?.first_name || 'Người'} {profile?.last_name || 'dùng'}
        {
          profile.is_verified && (
            <Ionicons name="checkmark-circle" size={24} color={colors.successColor} />
          )
        }
      </Text>
      <Text style={[styles.userRole, { color: colors.textSecondary }]}>
        {roles[profile?.role] || 'Người dùng'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    marginBottom: 10,
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: '35%',
    top: 70,
    backgroundColor: '#EB5B00',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userRole: {
    fontSize: 14,
    marginTop: 5,
  },
});
