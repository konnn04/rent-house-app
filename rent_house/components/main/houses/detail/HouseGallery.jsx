import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { ImageViewer } from '../../../common/ImageViewer';

const { width } = Dimensions.get('window');
const imageHeight = width * 0.7; // Aspect ratio for main image

export const HouseGallery = ({ media = [] }) => {
  const { colors } = useTheme();
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Filter only image media
  const images = media?.filter(item => item.type === 'image') || [];
  
  // Open fullscreen gallery
  const openFullscreen = (index) => {
    setSelectedImageIndex(index);
    setFullscreenVisible(true);
  };
  
  // Render main image
  const renderMainImage = () => {
    if (images.length === 0) {
      return (
        <Image
          source={require('@assets/images/default-house.png')}
          style={styles.mainImage}
          resizeMode="cover"
        />
      );
    }
    
    return (
      <TouchableOpacity onPress={() => openFullscreen(0)}>
        <Image
          source={{ uri: images[0].url }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };
  
  // Render thumbnail
  const renderThumbnail = ({ item, index }) => {
    // Skip first image as it's shown as main image
    if (index === 0) return null;
    
    return (
      <TouchableOpacity 
        style={styles.thumbnailContainer}
        onPress={() => openFullscreen(index)}
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Main image */}
      {renderMainImage()}
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <FlatList
          data={images.slice(0, 5)} // Show max 5 thumbnails
          renderItem={renderThumbnail}
          keyExtractor={(item, index) => `thumbnail-${item.id || index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}
        />
      )}
      
      {/* Image counter */}
      {images.length > 0 && (
        <View style={[styles.imageCounter, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <Text style={styles.imageCounterText}>
            {images.length} ảnh
          </Text>
        </View>
      )}
      
      <ImageViewer
        images={images}
        visible={fullscreenVisible}
        initialIndex={selectedImageIndex}
        onClose={() => setFullscreenVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: imageHeight,
  },
  thumbnailsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  thumbnailContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  thumbnail: {
    width: 80,
    height: 60,
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCounterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
