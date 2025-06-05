import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { submitIdentityVerificationService } from '../../../../services/userService';
import { PaperDialog } from '../../../common/PaperDialog';
import { ManageHeader } from './components/ManageHeader';

export const IdentityVerificationScreen = () => {
  const { colors } = useTheme();
  const infoLightColor = colors.infoLight || '#e6f7ff';  
  const infoDarkColor = colors.infoDark || '#0066cc';    
  
  const navigation = useNavigation();
  const route = useRoute();
  const { userData, fetchUserData } = useUser();
  
  const redirectAfter = route.params?.redirectAfter;
  
  const [idNumber, setIdNumber] = useState('');
  const [frontIdImage, setFrontIdImage] = useState(null);
  const [backIdImage, setBackIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });
  
  const pickImage = async (setter) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setDialogContent({
          title: 'Cần quyền truy cập',
          message: 'Ứng dụng cần quyền truy cập thư viện ảnh',
          actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
        });
        setDialogVisible(true);
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
      setDialogContent({
        title: 'Lỗi',
        message: 'Không thể chọn ảnh. Vui lòng thử lại.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
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
      const formData = new FormData();
      formData.append('id_number', idNumber);
      
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
      
      await submitIdentityVerificationService(formData);
      
      await fetchUserData();
      
      setDialogContent({
        title: 'Gửi thông tin thành công',
        message: 'Thông tin của bạn đã được gửi đi và đang chờ xác thực. Bạn có thể tiếp tục sử dụng ứng dụng trong khi chờ xác thực.',
        actions: [{
          label: 'OK',
          onPress: () => {
            setDialogVisible(false);
            if (redirectAfter) {
              navigation.navigate(redirectAfter);
            } else {
              navigation.goBack();
            }
          }
        }]
      });
      setDialogVisible(true);
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      
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
          setDialogContent({
            title: 'Lỗi',
            message: 'Không thể gửi thông tin xác thực. Vui lòng thử lại sau.',
            actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
          });
          setDialogVisible(true);
        }
      } else {
        setDialogContent({
          title: 'Lỗi',
          message: 'Không thể gửi thông tin xác thực. Vui lòng thử lại sau.',
          actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
        });
        setDialogVisible(true);
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
      
      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        message={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
      />
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
    borderLeftWidth: 4,  
    borderLeftColor: '#0066cc',  
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
