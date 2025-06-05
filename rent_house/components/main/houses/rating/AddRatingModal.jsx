import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  MD2Colors,
  TextInput
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { PaperDialog } from '../../../common/PaperDialog';

export const AddRatingModal = ({
  visible,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false
}) => {
  const { colors } = useTheme();
  const [rating, setRating] = useState(initialData?.star || 5);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });

  useEffect(() => {
    if (visible) {
      if (isEdit && initialData) {
        setRating(initialData.star || 5);
        setComment(initialData.comment || '');
        
        if (initialData.images && initialData.images.length > 0) {
          setImages(
            initialData.images.map(img => ({
              id: img.id,
              uri: img.url || img.image,
              isExisting: true,
            }))
          );
        } else {
          setImages([]);
        }
      } else {
        setRating(5);
        setComment('');
        setImages([]);
      }
    }
  }, [visible, initialData, isEdit]);
  
  const handleSubmit = () => {
    if (!comment.trim()) {
      setDialogContent({
        title: 'Lỗi',
        message: 'Vui lòng nhập đánh giá của bạn',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
      return;
    }
    
    const formData = {
      rating,
      comment,
      images: images.filter(img => !img.isExisting), 
    };
    
    setLoading(true);
    onSubmit(formData);
    setLoading(false);
  };
  
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setDialogContent({
          title: 'Lỗi',
          message: 'Cần quyền truy cập thư viện ảnh để chọn ảnh',
          actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
        });
        setDialogVisible(true);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - images.length, 
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(img => ({
          uri: img.uri,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        }));
        
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      setDialogContent({
        title: 'Lỗi',
        message: 'Không thể chọn ảnh. Vui lòng thử lại sau.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    }
  };
  
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderImageSection = () => {
    return (
      <View style={styles.imageSection}>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          Thêm hình ảnh (Tối đa 5 ảnh)
        </Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContainer}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: image.uri }}
                style={styles.imagePreview}
              />
              <IconButton
                icon="close-circle"
                size={20}
                iconColor={MD2Colors.red500}
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              />
            </View>
          ))}
          
          {images.length < 5 && (
            <TouchableOpacity
              style={[styles.addImageButton, { borderColor: colors.accentColor }]}
              onPress={handlePickImage}
            >
              <Icon name="camera-plus" size={30} color={colors.accentColor} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.backgroundPrimary }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {isEdit ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onClose}
            />
          </View>
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
                Đánh giá của bạn
              </Text>
              {renderStarRating()}
              <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
                {rating} / 5
              </Text>
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            <View style={styles.formGroup}>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
                Nhận xét của bạn
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Nhập nhận xét của bạn về nhà trọ này..."
                multiline
                numberOfLines={4}
                style={styles.commentInput}
                mode="outlined"
                outlineColor={colors.borderColor}
                activeOutlineColor={colors.accentColor}
              />
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            {renderImageSection()}
          </ScrollView>
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={[styles.button, { borderColor: colors.borderColor }]}
              labelStyle={{ color: colors.textPrimary }}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: colors.accentColor }]}
            >
              {isEdit ? 'Cập nhật' : 'Gửi đánh giá'}
            </Button>
          </View>
          
          <PaperDialog
            visible={dialogVisible}
            title={dialogContent.title}
            message={dialogContent.message}
            actions={dialogContent.actions}
            onDismiss={() => setDialogVisible(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  commentInput: {
    minHeight: 100,
  },
  imageSection: {
    marginBottom: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
    padding: 0,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
