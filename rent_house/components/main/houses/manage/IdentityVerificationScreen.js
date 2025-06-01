import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { submitIdentityVerificationService } from '../../../../services/userService';
import { ManageHeader } from './components/ManageHeader';

export const IdentityVerificationScreen = () => {
  const { colors } = useTheme();
  // Add fallback colors for info styling if not defined in theme
  const infoLightColor = colors.infoLight || '#e6f7ff';  // Light blue background
  const infoDarkColor = colors.infoDark || '#0066cc';    // Dark blue text
  
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = useUser();
  
  const redirectAfter = route.params?.redirectAfter;
  
  const [idNumber, setIdNumber] = useState('');
  const [frontIdImage, setFrontIdImage] = useState(null);
  const [backIdImage, setBackIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const pickImage = async (setter) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setter(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!idNumber.trim()) {
      newErrors.idNumber = 'Vui lòng nhập số CMND/CCCD';
    } else if (!/^\d{9,12}$/.test(idNumber.trim())) {
      newErrors.idNumber = 'Số CMND/CCCD phải có 9-12 chữ số';
    }
    
    if (!frontIdImage) {
      newErrors.frontIdImage = 'Vui lòng chọn ảnh mặt trước CMND/CCCD';
    }
    
    if (!backIdImage) {
      newErrors.backIdImage = 'Vui lòng chọn ảnh mặt sau CMND/CCCD';
    }
    
    if (!selfieImage) {
      newErrors.selfieImage = 'Vui lòng chọn ảnh chân dung';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('id_number', idNumber);
      
      // Add images to form data
      if (frontIdImage) {
        const uriParts = frontIdImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('front_id_image', {
          uri: frontIdImage,
          name: `front_id.${fileType}`,
          type: `image/${fileType}`,
        });
      }
      
      if (backIdImage) {
        const uriParts = backIdImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('back_id_image', {
          uri: backIdImage,
          name: `back_id.${fileType}`,
          type: `image/${fileType}`,
        });
      }
      
      if (selfieImage) {
        const uriParts = selfieImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('selfie_image', {
          uri: selfieImage,
          name: `selfie.${fileType}`,
          type: `image/${fileType}`,
        });
      }
      
      // Call API to submit verification
      await submitIdentityVerificationService(formData);
      
      // Update user data to reflect identity submission
      await userData.fetchUserData();
      
      Alert.alert(
        'Gửi thông tin thành công',
        'Thông tin của bạn đã được gửi đi và đang chờ xác thực. Bạn có thể tiếp tục sử dụng ứng dụng trong khi chờ xác thực.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the redirect page if specified
              if (redirectAfter) {
                navigation.navigate(redirectAfter);
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      
      // Handle field-specific errors
      if (error.response?.data) {
        const fieldErrors = {};
        Object.keys(error.response.data).forEach(key => {
          if (Array.isArray(error.response.data[key])) {
            fieldErrors[key] = error.response.data[key][0];
          } else {
            fieldErrors[key] = error.response.data[key];
          }
        });
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          Alert.alert('Lỗi', 'Không thể gửi thông tin xác thực. Vui lòng thử lại sau.');
        }
      } else {
        Alert.alert('Lỗi', 'Không thể gửi thông tin xác thực. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const renderImagePicker = (title, image, setter, error) => (
    <View style={styles.imagePickerContainer}>
      <Text style={[styles.imagePickerTitle, { color: colors.textPrimary }]}>{title}</Text>
      
      <TouchableOpacity 
        style={[
          styles.imagePicker, 
          { borderColor: error ? colors.dangerColor : colors.borderColor }
        ]} 
        onPress={() => pickImage(setter)}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="camera" size={40} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Nhấn để chọn ảnh
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      {error && (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      )}
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ManageHeader 
        title="Xác thực danh tính" 
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.infoBox, { backgroundColor: infoLightColor }]}>
            <Icon name="information" size={20} color={infoDarkColor} />
            <Text style={[styles.infoText, { color: infoDarkColor }]}>
              Để đảm bảo an toàn cho cả người thuê và chủ nhà, chúng tôi cần xác thực danh tính của bạn trước khi cho phép đăng tin cho thuê nhà.
            </Text>
          </View>
          
          <TextInput
            label="Số CMND/CCCD"
            value={idNumber}
            onChangeText={setIdNumber}
            keyboardType="number-pad"
            style={styles.input}
            error={!!errors.idNumber}
          />
          {errors.idNumber && (
            <HelperText type="error" visible={true}>
              {errors.idNumber}
            </HelperText>
          )}
          
          {renderImagePicker(
            'Ảnh mặt trước CMND/CCCD',
            frontIdImage,
            setFrontIdImage,
            errors.frontIdImage
          )}
          
          {renderImagePicker(
            'Ảnh mặt sau CMND/CCCD',
            backIdImage,
            setBackIdImage,
            errors.backIdImage
          )}
          
          {renderImagePicker(
            'Ảnh chân dung (selfie)',
            selfieImage,
            setSelfieImage,
            errors.selfieImage
          )}
          
          <Button
            mode="contained"
            loading={loading}
            disabled={loading}
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.accentColor }]}
            contentStyle={styles.submitButtonContent}
          >
            {loading ? 'Đang gửi...' : 'Gửi thông tin xác thực'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// Enhance the existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
    borderLeftWidth: 4,  // Add a left border for emphasis
    borderLeftColor: '#0066cc',  // Same as the default infoDarkColor
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
    fontSize: 14,
  },
  input: {
    marginBottom: 10,
  },
  imagePickerContainer: {
    marginBottom: 16,
  },
  imagePickerTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  imagePicker: {
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonContent: {
    paddingVertical: 10,
  },
});
