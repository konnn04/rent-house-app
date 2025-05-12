import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const ImageGallery = ({ mediaItems = [] }) => {
  const { colors } = useTheme();
  const [imageLoadError, setImageLoadError] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const handleImageLoadStart = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoadEnd = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index) => {
    setImageLoadError(prev => ({ ...prev, [index]: true }));
    setImageLoading(prev => ({ ...prev, [index]: false }));
    console.error(`Failed to load image at index ${index}`);
  };
  
  const openImageViewer = (index) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };
  
  // Tạo grid hiển thị tùy theo số lượng ảnh
  const renderPreviewGrid = () => {
    if (!mediaItems || mediaItems.length === 0) return null;
    
    const totalImages = mediaItems.length;
    
    // 1 ảnh
    if (totalImages === 1) {
      return renderSingleImage(mediaItems[0], 0);
    }
    
    // 2 ảnh
    if (totalImages === 2) {
      return (
        <View style={styles.rowContainer}>
          {renderGridImage(mediaItems[0], 0, '49.5%')}
          {renderGridImage(mediaItems[1], 1, '49.5%')}
        </View>
      );
    }
    
    // 3 ảnh
    if (totalImages === 3) {
      return (
        <View>
          <View style={styles.rowContainer}>
            {renderGridImage(mediaItems[0], 0, '100%')}
          </View>
          <View style={styles.rowContainer}>
            {renderGridImage(mediaItems[1], 1, '49.5%')}
            {renderGridImage(mediaItems[2], 2, '49.5%')}
          </View>
        </View>
      );
    }
    
    // 4 ảnh (2x2)
    if (totalImages === 4) {
      return (
        <View>
          <View style={styles.rowContainer}>
            {renderGridImage(mediaItems[0], 0, '49.5%')}
            {renderGridImage(mediaItems[1], 1, '49.5%')}
          </View>
          <View style={styles.rowContainer}>
            {renderGridImage(mediaItems[2], 2, '49.5%')}
            {renderGridImage(mediaItems[3], 3, '49.5%')}
          </View>
        </View>
      );
    }
    
    // 5+ ảnh: hiển thị 4 ảnh và thêm chỉ báo "+X ảnh"
    return (
      <View>
        <View style={styles.rowContainer}>
          {renderGridImage(mediaItems[0], 0, '49.5%')}
          {renderGridImage(mediaItems[1], 1, '49.5%')}
        </View>
        <View style={styles.rowContainer}>
          {renderGridImage(mediaItems[2], 2, '49.5%')}
          <View style={[styles.mediaContainer, { width: '49.5%' }]}>
            {renderGridImage(mediaItems[3], 3, '100%')}
            {totalImages > 4 && (
              <TouchableOpacity 
                style={styles.moreImagesOverlay}
                onPress={() => openImageViewer(4)}
              >
                <Text style={styles.moreImagesText}>+{totalImages - 4}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };
  
  // Render ảnh đơn full width
  const renderSingleImage = (item, index) => {
    return (
      <View style={styles.mediaContainer}>
        <TouchableOpacity onPress={() => openImageViewer(index)}>
          <Image 
            source={{ 
              uri: item.url || item.thumbnail || item.medium || 'https://via.placeholder.com/800x600' 
            }}
            style={styles.fullWidthImage}
            resizeMode="cover"
            onLoadStart={() => handleImageLoadStart(index)}
            onLoad={() => handleImageLoadEnd(index)}
            onError={() => handleImageError(index)}
          />
        </TouchableOpacity>
        {renderOverlays(index)}
      </View>
    );
  };
  
  // Render ảnh trong grid
  const renderGridImage = (item, index, width) => {
    if (!item) return null;
    
    return (
      <View style={[styles.mediaContainer, { width }]}>
        <TouchableOpacity onPress={() => openImageViewer(index)}>
          <Image 
            source={{ 
              uri: item.url || item.thumbnail || item.medium || 'https://via.placeholder.com/800x600' 
            }}
            style={styles.gridImage}
            resizeMode="cover"
            onLoadStart={() => handleImageLoadStart(index)}
            onLoad={() => handleImageLoadEnd(index)}
            onError={() => handleImageError(index)}
          />
        </TouchableOpacity>
        {renderOverlays(index)}
      </View>
    );
  };
  
  // Render overlays (loading, error)
  const renderOverlays = (index) => {
    return (
      <>
        {imageLoading[index] && (
          <View style={styles.imageLoadingOverlay}>
            <ActivityIndicator size="large" color={colors.accentColor} />
          </View>
        )}
        {imageLoadError[index] && (
          <View style={styles.imageErrorOverlay}>
            <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>Không thể hiển thị hình ảnh</Text>
          </View>
        )}
      </>
    );
  };
  
  // Render modal xem ảnh chi tiết
  const renderImageViewer = () => {
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.imageCounter}>
              {selectedIndex + 1} / {mediaItems.length}
            </Text>
          </View>
          
          <FlatList
            data={mediaItems}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedIndex}
            getItemLayout={(data, index) => ({
              length: Dimensions.get('window').width,
              offset: Dimensions.get('window').width * index,
              index,
            })}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `image-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ 
                    uri: item.url || item.medium || item.thumbnail || 'https://via.placeholder.com/800x600' 
                  }}
                  style={styles.modalImage}
                  resizeMode="contain"
                  onLoadStart={() => handleImageLoadStart(`modal-${index}`)}
                  onLoad={() => handleImageLoadEnd(`modal-${index}`)}
                  onError={() => handleImageError(`modal-${index}`)}
                />
                {imageLoading[`modal-${index}`] && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </View>
            )}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(
                event.nativeEvent.contentOffset.x / Dimensions.get('window').width
              );
              setSelectedIndex(newIndex);
            }}
          />
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderPreviewGrid()}
      {renderImageViewer()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  fullWidthImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  gridImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  imageErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  moreImagesText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
  },
  closeButton: {
    padding: 5,
  },
  imageCounter: {
    color: '#fff',
    fontSize: 16,
  },
  modalImageContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
});

export default ImageGallery;