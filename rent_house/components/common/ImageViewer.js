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

/**
 * A reusable image viewer component that displays images in a modal with fullscreen view
 * and swipe navigation between images.
 */
export const ImageViewer = ({ 
  images = [], 
  visible = false, 
  initialIndex = 0,
  onClose,
  backgroundColor = 'rgba(0,0,0,0.9)'
}) => {
  const [imageLoading, setImageLoading] = useState({});
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const handleImageLoadStart = (index) => {
    setImageLoading(prev => ({ ...prev, [`modal-${index}`]: true }));
  };

  const handleImageLoadEnd = (index) => {
    setImageLoading(prev => ({ ...prev, [`modal-${index}`]: false }));
  };

  const handleImageError = (index) => {
    setImageLoading(prev => ({ ...prev, [`modal-${index}`]: false }));
    console.error(`Failed to load image at index ${index}`);
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
        
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
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
                onLoadStart={() => handleImageLoadStart(index)}
                onLoad={() => handleImageLoadEnd(index)}
                onError={() => handleImageError(index)}
              />
              {imageLoading[`modal-${index}`] && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
          )}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.ceil(
            (event.nativeEvent.contentOffset.x - 20)/ Dimensions.get('window').width 
            );
            setCurrentIndex(newIndex);
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    position: 'absolute',
    zIndex: 1,
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
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
