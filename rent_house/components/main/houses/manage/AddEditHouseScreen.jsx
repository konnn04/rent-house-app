import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { Button, HelperText, SegmentedButtons, Switch, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import {
  createHouseService,
  getDetailHouseService,
  updateHouseService
} from '../../../../services/houseService';
import { LocationPickerComponent } from '../../posts/components/LocationPickerComponent';
import { ManageHeader } from './components/ManageHeader';

export const AddEditHouseScreen = ({ houseId, isEditing = false }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [area, setArea] = useState(''); // New field for house area
  const [deposit, setDeposit] = useState(''); // New field for deposit
  const [isRenting, setIsRenting] = useState(false); // New flag for rental status
  const [waterPrice, setWaterPrice] = useState('');
  const [electricityPrice, setElectricityPrice] = useState('');
  const [internetPrice, setInternetPrice] = useState('');
  const [trashPrice, setTrashPrice] = useState('');
  const [type, setType] = useState('house');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [maxRooms, setMaxRooms] = useState('');
  const [currentRooms, setCurrentRooms] = useState(''); // For tracking rooms currently rented
  const [maxPeople, setMaxPeople] = useState('');
  const [images, setImages] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEditing && houseId) {
      fetchHouseDetails();
    }
  }, [isEditing, houseId]);
  
  const fetchHouseDetails = async () => {
    try {
      setLoading(true);
      const house = await getDetailHouseService(houseId);

      // Populate form fields
      setTitle(house.title || '');
      setDescription(house.description || '');
      setAddress(house.address || '');
      setBasePrice(house.base_price?.toString() || '');
      setArea(house.area?.toString() || ''); // Add area field
      setDeposit(house.deposit?.toString() || ''); // Add deposit field
      setIsRenting(house.is_renting || false); // Add rental status
      setWaterPrice(house.water_price?.toString() || '');
      setElectricityPrice(house.electricity_price?.toString() || '');
      setInternetPrice(house.internet_price?.toString() || '');
      setTrashPrice(house.trash_price?.toString() || '');
      setType(house.type || 'house');
      setLatitude(house.latitude?.toString() || '');
      setLongitude(house.longitude?.toString() || '');
      setMaxRooms(house.max_rooms?.toString() || '');
      setCurrentRooms(house.current_rooms?.toString() || ''); // Add current rooms
      setMaxPeople(house.max_people?.toString() || '');
      
      // Convert media to the format needed for our image picker
      if (house.media && house.media.length > 0) {
        const formattedImages = house.media.map(media => ({
          uri: media.url,
          id: media.id
        }));
        setImages(formattedImages);
      }
      
    } catch (error) {
      console.error('Error fetching house details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin nhà. Vui lòng thử lại sau.');
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
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    }
    
    if (!address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    
    if (!basePrice.trim()) {
      newErrors.basePrice = 'Vui lòng nhập giá cơ bản';
    } else if (isNaN(basePrice) || Number(basePrice) <= 0) {
      newErrors.basePrice = 'Giá cơ bản phải là số dương';
    }
    
    // Validate area field
    if (!area.trim()) {
      newErrors.area = 'Vui lòng nhập diện tích';
    } else if (isNaN(area) || Number(area) <= 0) {
      newErrors.area = 'Diện tích phải là số dương';
    }
    
    // Validate deposit field
    if (deposit.trim() && (isNaN(deposit) || Number(deposit) < 0)) {
      newErrors.deposit = 'Tiền cọc phải là số dương hoặc 0';
    }
    
    if (waterPrice.trim() && (isNaN(waterPrice) || Number(waterPrice) < 0)) {
      newErrors.waterPrice = 'Giá nước phải là số dương hoặc 0';
    }
    
    if (electricityPrice.trim() && (isNaN(electricityPrice) || Number(electricityPrice) < 0)) {
      newErrors.electricityPrice = 'Giá điện phải là số dương hoặc 0';
    }
    
    if (internetPrice.trim() && (isNaN(internetPrice) || Number(internetPrice) < 0)) {
      newErrors.internetPrice = 'Giá internet phải là số dương hoặc 0';
    }
    
    if (trashPrice.trim() && (isNaN(trashPrice) || Number(trashPrice) < 0)) {
      newErrors.trashPrice = 'Giá rác phải là số dương hoặc 0';
    }
    
    if (!type) {
      newErrors.type = 'Vui lòng chọn loại nhà';
    }
    
    // Validate max_rooms and current_rooms only for dormitory and room types
    if (type === 'dormitory' || type === 'room') {
      if (!maxRooms.trim() || isNaN(maxRooms) || Number(maxRooms) <= 0) {
        newErrors.maxRooms = 'Vui lòng nhập số phòng tối đa (lớn hơn 0)';
      }
      
      if (currentRooms.trim() && (isNaN(currentRooms) || Number(currentRooms) < 0)) {
        newErrors.currentRooms = 'Số phòng đã cho thuê phải là số dương hoặc 0';
      }
      
      if (currentRooms.trim() && maxRooms.trim() && Number(currentRooms) > Number(maxRooms)) {
        newErrors.currentRooms = 'Số phòng đã cho thuê không thể lớn hơn số phòng tối đa';
      }
    }
    
    // Always validate max_people
    if (!maxPeople.trim() || isNaN(maxPeople) || Number(maxPeople) <= 0) {
      newErrors.maxPeople = 'Vui lòng nhập số người tối đa (lớn hơn 0)';
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
      formData.append('title', title);
      formData.append('description', description);
      formData.append('address', address);
      formData.append('base_price', basePrice);
      formData.append('area', area); // Add area field
      formData.append('is_renting', isRenting ? 'true' : 'false'); // Add rental status
      if (deposit) formData.append('deposit', deposit); // Add deposit field
      formData.append('type', type);
      
      if (waterPrice) formData.append('water_price', waterPrice);
      if (electricityPrice) formData.append('electricity_price', electricityPrice);
      if (internetPrice) formData.append('internet_price', internetPrice);
      if (trashPrice) formData.append('trash_price', trashPrice);
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      
      // Always add max_people
      formData.append('max_people', maxPeople);
      
      // Add max_rooms and current_rooms only for dormitory and room types
      if (type === 'dormitory' || type === 'room') {
        formData.append('max_rooms', maxRooms);
        if (currentRooms) formData.append('current_rooms', currentRooms);
      }
      
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
      
      let data;
      
      if (isEditing) {
        // Update existing house
        data = await updateHouseService(houseId, formData);
      } else {
        // Create new house
        data = await createHouseService(formData);
      }

      Alert.alert(
        isEditing ? 'Cập nhật thành công' : 'Tạo thành công',
        isEditing ? 'Thông tin nhà đã được cập nhật.' : 'Nhà đã được tạo thành công.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error submitting house:', error);
      Alert.alert(
        'Lỗi',
        isEditing ? (error?.response?.data?.error|| 'Không thể cập nhật thông tin nhà. Vui lòng thử lại.') :
          (error?.response?.data?.error || 'Không thể tạo nhà mới. Vui lòng thử lại.'),
        [
          {
            text: 'OK',
          }
        ]
      );
      setErrors({ submit: 'Không thể lưu thông tin nhà. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle location selection from map
  const handleLocationSelected = (selectedAddress, lat, lng) => {
    setAddress(selectedAddress);
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setShowLocationPicker(false);
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ManageHeader 
          title={isEditing ? "Chỉnh sửa nhà" : "Thêm nhà mới"} 
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
        title={isEditing ? "Chỉnh sửa nhà" : "Thêm nhà mới"} 
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {showLocationPicker && (
        <LocationPickerComponent
          onLocationSelected={handleLocationSelected}
          onCancel={() => setShowLocationPicker(false)}
          initialAddress={address}
          initialLocation={
            latitude && longitude 
              ? { 
                  latitude: parseFloat(latitude), 
                  longitude: parseFloat(longitude) 
                } 
              : null
          }
          colors={colors}
        />
      )}
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <TextInput
            label="Tiêu đề"
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
            error={!!errors.description}
            multiline
            numberOfLines={4}
          />
          {errors.description && (
            <HelperText type="error" visible={true}>
              {errors.description}
            </HelperText>
          )}
          
          <TextInput
            label="Địa chỉ"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            error={!!errors.address}
          />
          {errors.address && (
            <HelperText type="error" visible={true}>
              {errors.address}
            </HelperText>
          )}
          
          <Button 
            mode="outlined" 
            icon="map-marker" 
            onPress={() => setShowLocationPicker(true)}
            style={styles.mapPickerButton}
          >
            Chọn vị trí trên bản đồ
          </Button>
          
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tọa độ</Text>
          <View style={styles.locationInfoContainer}>
            {latitude && longitude ? (
              <Text style={[styles.locationConfirmed, {color: colors.successColor}]}>
                <Icon name="check-circle" size={16} /> Đã chọn vị trí
              </Text>
            ) : (
              <Text style={[styles.locationMissing, {color: colors.warningColor}]}>
                <Icon name="alert-circle" size={16} /> Chưa chọn vị trí
              </Text>
            )}
          </View>
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <TextInput
                label="Vĩ độ"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                style={styles.input}
                disabled={true}
              />
            </View>
            
            <View style={styles.priceItem}>
              <TextInput
                label="Kinh độ"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                style={styles.input}
                disabled={true}
              />
            </View>
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Loại nhà</Text>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={[
              { value: 'house', label: 'Nhà riêng' },
              { value: 'apartment', label: 'Căn hộ' },
            ]}
            style={styles.segmentedButtons}
          />
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={[
              { value: 'dormitory', label: 'Ký túc xá' },
              { value: 'room', label: 'Phòng trọ' },
            ]}
            style={[styles.segmentedButtons, { marginTop: 10 }]}
          />
          {errors.type && (
            <HelperText type="error" visible={true}>
              {errors.type}
            </HelperText>
          )}
          
          {/* Area field - always visible */}
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
          
          {/* Is renting switch */}
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Đang cho thuê</Text>
            <Switch
              value={isRenting}
              onValueChange={setIsRenting}
              color={colors.accentColor}
            />
          </View>
          
          {/* Max people field - always visible */}
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
          
          {/* Max rooms and current rooms - only for dormitory and room types */}
          {(type === 'dormitory' || type === 'room') && (
            <>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Số phòng tối đa"
                    value={maxRooms}
                    onChangeText={setMaxRooms}
                    keyboardType="numeric"
                    style={styles.input}
                    error={!!errors.maxRooms}
                  />
                  {errors.maxRooms && (
                    <HelperText type="error" visible={true}>
                      {errors.maxRooms}
                    </HelperText>
                  )}
                </View>
                
                <View style={styles.halfInput}>
                  <TextInput
                    label="Số phòng đã cho thuê"
                    value={currentRooms}
                    onChangeText={setCurrentRooms}
                    keyboardType="numeric"
                    style={styles.input}
                    error={!!errors.currentRooms}
                  />
                  {errors.currentRooms && (
                    <HelperText type="error" visible={true}>
                      {errors.currentRooms}
                    </HelperText>
                  )}
                </View>
              </View>
            </>
          )}
          
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Giá cả</Text>
          
          <TextInput
            label="Giá cơ bản (VNĐ/tháng)"
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.basePrice}
          />
          {errors.basePrice && (
            <HelperText type="error" visible={true}>
              {errors.basePrice}
            </HelperText>
          )}
          
          {/* Deposit field */}
          <TextInput
            label="Tiền cọc (VNĐ)"
            value={deposit}
            onChangeText={setDeposit}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.deposit}
          />
          {errors.deposit && (
            <HelperText type="error" visible={true}>
              {errors.deposit}
            </HelperText>
          )}
          
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <TextInput
                label="Giá nước (VNĐ/m³)"
                value={waterPrice}
                onChangeText={setWaterPrice}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.waterPrice}
              />
              {errors.waterPrice && (
                <HelperText type="error" visible={true}>
                  {errors.waterPrice}
                </HelperText>
              )}
            </View>
            
            <View style={styles.priceItem}>
              <TextInput
                label="Giá điện (VNĐ/kWh)"
                value={electricityPrice}
                onChangeText={setElectricityPrice}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.electricityPrice}
              />
              {errors.electricityPrice && (
                <HelperText type="error" visible={true}>
                  {errors.electricityPrice}
                </HelperText>
              )}
            </View>
          </View>
          
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <TextInput
                label="Giá internet (VNĐ/tháng)"
                value={internetPrice}
                onChangeText={setInternetPrice}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.internetPrice}
              />
              {errors.internetPrice && (
                <HelperText type="error" visible={true}>
                  {errors.internetPrice}
                </HelperText>
              )}
            </View>
            
            <View style={styles.priceItem}>
              <TextInput
                label="Giá rác (VNĐ/tháng)"
                value={trashPrice}
                onChangeText={setTrashPrice}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.trashPrice}
              />
              {errors.trashPrice && (
                <HelperText type="error" visible={true}>
                  {errors.trashPrice}
                </HelperText>
              )}
            </View>
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hình ảnh</Text>
          
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
            {submitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 80, // Increased bottom padding for Android
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    width: '48%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  halfInput: {
    width: '48%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 5,
  },
  switchLabel: {
    fontSize: 16,
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
  mapPickerButton: {
    marginBottom: 16,
  },
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationConfirmed: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationMissing: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
