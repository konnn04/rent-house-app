import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';
import { api } from '../../../utils/Fetch';
import { HouseLinkSelector } from './components/HouseLinkSelector';
import { ImagePickerComponent } from './components/ImagePickerComponent';
import { LocationPickerComponent } from './components/LocationPickerComponent';
import { PostTypeSelector } from './components/PostTypeSelector';

export const CreatePostScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { userData } = useUser();

  // Check if user is an owner
  const isOwner = userData?.role === 'owner';

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // Set default post type based on user role
  const [postType, setPostType] = useState(isOwner ? 'rental_listing' : 'question');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [selectedImages, setSelectedImages] = useState([]);
  const [linkedHouse, setLinkedHouse] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showHousePicker, setShowHousePicker] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});

  // Check permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập vào thư viện ảnh để thêm ảnh vào bài đăng');
        }
      }
    })();
  }, []);

  // Handle image selection
  const handleImagesSelected = useCallback((images) => {
    setSelectedImages(images);
  }, []);

  // Handle image removal
  const handleRemoveImage = useCallback((index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle location selection
  const handleLocationSelected = useCallback((address, lat, lng) => {
    setAddress(address);
    setLocation({ latitude: lat, longitude: lng });
    setShowLocationPicker(false);
  }, []);

  // Handle house selection
  const handleHouseSelected = useCallback((house) => {
    setLinkedHouse(house);
    if (house) {
      setAddress(house.address);
      setLocation({
        latitude: house.latitude,
        longitude: house.longitude
      });
    }
    setShowHousePicker(false);
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!content.trim()) newErrors.content = 'Vui lòng nhập nội dung';
    if (!address.trim()) newErrors.address = 'Vui lòng chọn địa chỉ';
    if (!location.latitude || !location.longitude) {
      newErrors.location = 'Vị trí không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle post submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create form data for multipart/form-data
      const formData = new FormData();
      formData.append('type', postType);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('address', address);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);

      if (isOwner && linkedHouse) {
        formData.append('house_link', linkedHouse.id);
      }

      // Add images
      selectedImages.forEach((image, index) => {
        const imageUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
        const filename = image.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image';

        formData.append('images', {
          uri: imageUri,
          name: filename,
          type: fileType
        });
      });

      // Submit post
      const response = await api.post('/api/posts/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Navigate back on success
      Alert.alert('Thành công', 'Bài đăng đã được tạo thành công', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Lỗi', 'Không thể tạo bài đăng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Tạo bài đăng mới
          </Text>
        </View>

        {/* Post type selector */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Loại bài đăng
          </Text>
          <PostTypeSelector
            selectedType={postType}
            onSelectType={setPostType}
            colors={colors}
            isOwner={isOwner}
          />
        </View>

        {/* Title input */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Tiêu đề
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary },
              errors.title && styles.inputError
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tiêu đề bài đăng"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title}</Text>
          )}
        </View>

        {/* Content input */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Nội dung
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary },
              errors.content && styles.inputError
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Mô tả chi tiết về bài đăng của bạn..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.content && (
            <Text style={styles.errorText}>{errors.content}</Text>
          )}
        </View>

        {/* Image Picker */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Hình ảnh
          </Text>
          <ImagePickerComponent
            images={selectedImages}
            onImagesSelected={handleImagesSelected}
            onRemoveImage={handleRemoveImage}
            colors={colors}
          />
        </View>

        {/* House Link - Only for owners */}
        {isOwner && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Liên kết với nhà/phòng (tùy chọn)
            </Text>
            <TouchableOpacity
              style={[
                styles.linkButton,
                { backgroundColor: colors.backgroundSecondary }
              ]}
              onPress={() => setShowHousePicker(true)}
            >
              <Icon name="home-outline" size={24} color={colors.accentColor} />
              <Text style={{ color: colors.textPrimary, marginLeft: 10 }}>
                {linkedHouse ? `Đã chọn: ${linkedHouse.title}` : 'Chọn nhà/phòng'}
              </Text>
            </TouchableOpacity>

            {showHousePicker && (
              <HouseLinkSelector
                onSelectHouse={handleHouseSelected}
                onCancel={() => setShowHousePicker(false)}
                colors={colors}
              />
            )}
          </View>
        )}

        {/* Location */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Địa chỉ
          </Text>
          <TouchableOpacity
            style={[
              styles.linkButton,
              { backgroundColor: colors.backgroundSecondary },
              errors.address && styles.inputError
            ]}
            onPress={() => setShowLocationPicker(true)}
          >
            <Icon name="map-marker" size={24} color={colors.accentColor} />
            <Text style={{ color: colors.textPrimary, marginLeft: 10, flex: 1 }} numberOfLines={1}>
              {address || 'Chọn địa điểm'}
            </Text>
          </TouchableOpacity>
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}

          {showLocationPicker && (
            <LocationPickerComponent
              onLocationSelected={handleLocationSelected}
              onCancel={() => setShowLocationPicker(false)}
              initialAddress={address}
              initialLocation={location.latitude && location.longitude ? location : null}
              colors={colors}
            />
          )}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: loading ? colors.disabledColor : colors.accentColor }
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Đăng bài</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 50 : 100, // Increased bottom padding for Android
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 4,
    fontSize: 12,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
