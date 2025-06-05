import * as ImagePicker from 'expo-image-picker';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ImagePickerComponent = ({ images = [], onImagesSelected, onRemoveImage, colors, maxImages = 10 }) => {
  const pickImages = async () => {
    try {
      if (images.length >= maxImages) {
        alert(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh`);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: maxImages - images.length
      });
      
      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: asset.uri.split('/').pop()
        }));
        
        onImagesSelected([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      alert('Không thể chọn ảnh. Vui lòng thử lại sau.');
    }
  };

  const handleRemoveImage = (index) => {
    onRemoveImage(index);
  };

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <FlatList
          data={images}
          keyExtractor={(_, index) => `image-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageListContent}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.dangerColor }]}
                onPress={() => handleRemoveImage(index)}
              >
                <Icon name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: colors.backgroundSecondary }
        ]}
        onPress={pickImages}
      >
        <Icon name="image-plus" size={32} color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
          {images.length > 0 ? 'Thêm ảnh' : 'Thêm ảnh (tối đa 10)'}
        </Text>
      </TouchableOpacity>
      
      {images.length > 0 && (
        <Text style={[styles.imageCount, { color: colors.textSecondary }]}>
          {images.length}/{maxImages} ảnh
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  imageListContent: {
    paddingVertical: 10,
  },
  imageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  imageCount: {
    marginTop: 8,
    textAlign: 'right',
    fontSize: 12,
  },
});
