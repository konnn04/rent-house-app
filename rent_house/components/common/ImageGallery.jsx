import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ImageViewer } from './ImageViewer';

export const ImageGallery = ({ mediaItems = [], containerWidth }) => {
  const { colors } = useTheme();
  const [imageLoadError, setImageLoadError] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const screenWidth = Dimensions.get('window').width;
  const actualWidth = containerWidth || screenWidth - 40; 
  
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
  
  const renderSingleImage = (item, index) => {
    const aspectRatio = 1.5; 
    
    return (
      <View style={[styles.mediaContainer, { width: actualWidth }]}>
        <TouchableOpacity onPress={() => openImageViewer(index)}>
          <Image 
            source={{ 
              uri: item.url || item.thumbnail || item.medium || 'https://via.placeholder.com/800x600' 
            }}
            style={[styles.fullWidthImage, { width: actualWidth, height: actualWidth / aspectRatio }]}
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
  
  const renderGridImage = (item, index, width) => {
    if (!item) return null;
    
    const widthInPixels = typeof width === 'string' && width.endsWith('%') 
      ? (parseFloat(width) / 100) * actualWidth
      : parseFloat(width);
    
    return (
      <View style={[styles.mediaContainer, { width }]}>
        <TouchableOpacity onPress={() => openImageViewer(index)}>
          <Image 
            source={{ 
              uri: item.url || item.thumbnail || item.medium || 'https://via.placeholder.com/800x600' 
            }}
            style={[styles.gridImage, { width: widthInPixels, height: 150 }]}
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
  
  const renderPreviewGrid = () => {
    if (!mediaItems || mediaItems.length === 0) return null;
    
    const totalImages = mediaItems.length;
    
    if (totalImages === 1) {
      return renderSingleImage(mediaItems[0], 0);
    }
    
    if (totalImages === 2) {
      return (
        <View style={[styles.rowContainer, { width: actualWidth }]}>
          {renderGridImage(mediaItems[0], 0, '49.5%')}
          {renderGridImage(mediaItems[1], 1, '49.5%')}
        </View>
      );
    }
    
    if (totalImages === 3) {
      return (
        <View style={{ width: actualWidth }}>
          <View style={[styles.rowContainer, { width: actualWidth }]}>
            {renderGridImage(mediaItems[0], 0, '100%')}
          </View>
          <View style={[styles.rowContainer, { width: actualWidth }]}>
            {renderGridImage(mediaItems[1], 1, '49.5%')}
            {renderGridImage(mediaItems[2], 2, '49.5%')}
          </View>
        </View>
      );
    }
    
    if (totalImages === 4) {
      return (
        <View style={{ width: actualWidth }}>
          <View style={[styles.rowContainer, { width: actualWidth }]}>
            {renderGridImage(mediaItems[0], 0, '49.5%')}
            {renderGridImage(mediaItems[1], 1, '49.5%')}
          </View>
          <View style={[styles.rowContainer, { width: actualWidth }]}>
            {renderGridImage(mediaItems[2], 2, '49.5%')}
            {renderGridImage(mediaItems[3], 3, '49.5%')}
          </View>
        </View>
      );
    }
    
    return (
      <View style={{ width: actualWidth }}>
        <View style={[styles.rowContainer, { width: actualWidth }]}>
          {renderGridImage(mediaItems[0], 0, '49.5%')}
          {renderGridImage(mediaItems[1], 1, '49.5%')}
        </View>
        <View style={[styles.rowContainer, { width: actualWidth }]}>
          {renderGridImage(mediaItems[2], 2, '49.5%')}
          <View style={[styles.mediaContainer, { width: '49.5%' }]}>
            {renderGridImage(mediaItems[3], 3, '49.5%')}
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
  
  return (
    <View style={styles.container}>
      {renderPreviewGrid()}
      <ImageViewer 
        images={mediaItems}
        visible={modalVisible}
        initialIndex={selectedIndex}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%', 
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
});
