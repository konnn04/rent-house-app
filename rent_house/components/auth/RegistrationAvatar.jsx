import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';

export const RegistrationAvatar = ({ onAvatarChange, error }) => {
  const { colors } = useTheme();
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  
  const handleSelectAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn avatar');
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
        
        setAvatarUri(imageUri);
        
        if (onAvatarChange) {
          onAvatarChange({
            uri: imageUri,
            name: filename || 'avatar.jpg',
            type: type
          });
        }
        
        setAvatarLoading(false);
      }
    } catch (error) {
      console.error('Error selecting avatar:', error);
      Alert.alert('Lỗi', 'Không thể chọn avatar. Vui lòng thử lại sau.');
      setAvatarLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>Avatar</Text>
      
      <View style={styles.avatarSection}>
        <View style={[
          styles.avatarContainer, 
          error ? { borderWidth: 2, borderColor: colors.dangerColor } : null
        ]}>
          <Avatar.Image 
            size={100} 
            source={avatarUri ? 
              { uri: avatarUri } : 
              require('@assets/images/default-avatar.png')
            } 
            style={styles.avatar}
          />
          {avatarLoading && (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.selectButton, { backgroundColor: colors.accentColor }]}
          onPress={handleSelectAvatar}
          disabled={avatarLoading}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.selectButtonText}>Chọn Avatar</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: colors.dangerColor }]}>
          {error}
        </Text>
      )}
      
      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        Avatar giúp người dùng khác nhận diện bạn dễ dàng hơn
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
    borderRadius: 50,
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
  selectButton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
});
