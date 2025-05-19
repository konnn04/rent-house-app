import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { api } from '../../../../utils/Fetch';
import { ManageHeader } from './components/ManageHeader';

export const AddEditRoomScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { houseId, houseTitle, roomId, isEditing } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [maxPeople, setMaxPeople] = useState('1');
  const [images, setImages] = useState([]);
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEditing && roomId) {
      fetchRoomDetails();
    }
  }, [isEditing, roomId]);
  
  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/rooms/${roomId}/`);
      const room = response.data;
      
      // Populate form fields
      setTitle(room.title || '');
      setDescription(room.description || '');
      setPrice(room.price?.toString() || '');
      setArea(room.area?.toString() || '');
      setBedrooms(room.bedrooms?.toString() || '1');
      setBathrooms(room.bathrooms?.toString() || '1');
      setMaxPeople(room.max_people?.toString() || '1');
      
      // Convert media to the format needed for our image picker
      if (room.media && room.media.length > 0) {
        const formattedImages = room.media.map(media => ({
          uri: media.url,
          id: media.id
        }));
        setImages(formattedImages);
      }
      
    } catch (error) {
      console.error('Error fetching room details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng. Vui lòng thử lại sau.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add new images to existing ones
        const newImages = result.assets.map(asset => ({ uri: asset.uri }));
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề phòng';
    }
    
    if (!price.trim()) {
      newErrors.price = 'Vui lòng nhập giá phòng';
    } else if (isNaN(price) || Number(price) <= 0) {
      newErrors.price = 'Giá phòng phải là số dương';
    }
    
    if (!area.trim()) {
      newErrors.area = 'Vui lòng nhập diện tích phòng';
    } else if (isNaN(area) || Number(area) <= 0) {
      newErrors.area = 'Diện tích phòng phải là số dương';
    }
    
    if (!maxPeople.trim()) {
      newErrors.maxPeople = 'Vui lòng nhập số người tối đa';
    } else if (isNaN(maxPeople) || Number(maxPeople) <= 0 || !Number.isInteger(Number(maxPeople))) {
      newErrors.maxPeople = 'Số người tối đa phải là số nguyên dương';
    }
    
    if (!bedrooms.trim()) {
      newErrors.bedrooms = 'Vui lòng nhập số phòng ngủ';
    } else if (isNaN(bedrooms) || Number(bedrooms) <= 0 || !Number.isInteger(Number(bedrooms))) {
      newErrors.bedrooms = 'Số phòng ngủ phải là số nguyên dương';
    }
    
    if (!bathrooms.trim()) {
      newErrors.bathrooms = 'Vui lòng nhập số phòng tắm';
    } else if (isNaN(bathrooms) || Number(bathrooms) <= 0 || !Number.isInteger(Number(bathrooms))) {
      newErrors.bathrooms = 'Số phòng tắm phải là số nguyên dương';
    }
    
    if (!isEditing && images.length === 0) {
      newErrors.images = 'Vui lòng chọn ít nhất một ảnh';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('house', houseId);
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('price', price);
      formData.append('area', area);
      formData.append('bedrooms', bedrooms);
      formData.append('bathrooms', bathrooms);
      formData.append('max_people', maxPeople);
      
      // Add new images (not the ones already in the database)
      const newImages = images.filter(img => !img.id);
      newImages.forEach((image, index) => {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('images', {
          uri: image.uri,
          name: `image_${index}.${fileType}`,
          type: `image/${fileType}`,
        });
      });
      
      let response;
      
      if (isEditing) {
        // Update existing room
        response = await api.patch(`/api/rooms/${roomId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new room
        response = await api.post('/api/rooms/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      Alert.alert(
        isEditing ? 'Cập nhật thành công' : 'Tạo phòng thành công',
        isEditing ? 'Thông tin phòng đã được cập nhật.' : 'Phòng đã được tạo thành công.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('RoomList', { houseId, houseTitle });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error submitting room:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin phòng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ManageHeader 
          title={isEditing ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
            Đang tải thông tin...
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ManageHeader 
        title={isEditing ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        subtitle={houseTitle}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            label="Tiêu đề phòng"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            error={!!errors.title}
          />
          {errors.title && (
            <HelperText type="error" visible={true}>
              {errors.title}
            </HelperText>
          )}
          
          <TextInput
            label="Mô tả"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                label="Giá phòng (VNĐ/tháng)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.price}
              />
              {errors.price && (
                <HelperText type="error" visible={true}>
                  {errors.price}
                </HelperText>
              )}
            </View>
            
            <View style={styles.halfInput}>
              <TextInput
                label="Diện tích (m²)"
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.area}
              />
              {errors.area && (
                <HelperText type="error" visible={true}>
                  {errors.area}
                </HelperText>
              )}
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                label="Phòng ngủ"
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.bedrooms}
              />
              {errors.bedrooms && (
                <HelperText type="error" visible={true}>
                  {errors.bedrooms}
                </HelperText>
              )}
            </View>
            
            <View style={styles.halfInput}>
              <TextInput
                label="Phòng tắm"
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.bathrooms}
              />
              {errors.bathrooms && (
                <HelperText type="error" visible={true}>
                  {errors.bathrooms}
                </HelperText>
              )}
            </View>
          </View>
          
          <TextInput
            label="Số người tối đa"
            value={maxPeople}
            onChangeText={setMaxPeople}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.maxPeople}
          />
          {errors.maxPeople && (
            <HelperText type="error" visible={true}>
              {errors.maxPeople}
            </HelperText>
          )}
          
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hình ảnh phòng</Text>
          
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity 
                  style={[styles.removeButton, { backgroundColor: colors.dangerColor }]}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={[styles.addImageButton, { borderColor: colors.accentColor }]}
              onPress={pickImages}
            >
              <Icon name="camera-plus" size={30} color={colors.accentColor} />
              <Text style={[styles.addImageText, { color: colors.accentColor }]}>
                Thêm ảnh
              </Text>
            </TouchableOpacity>
          </View>
          
          {errors.images && (
            <HelperText type="error" visible={true} style={styles.imageError}>
              {errors.images}
            </HelperText>
          )}
          
          <Button
            mode="contained"
            loading={submitting}
            disabled={submitting}
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.accentColor }]}
            contentStyle={styles.submitButtonContent}
          >
            {submitting ? 'Đang lưu...' : isEditing ? 'Cập nhật phòng' : 'Tạo phòng mới'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageContainer: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
  },
  imageError: {
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonContent: {
    paddingVertical: 10,
  },
});
