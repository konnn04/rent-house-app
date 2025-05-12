import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ImageGallery from '../common/ImageGallery'; // Import component mới

const PostItem = ({ post }) => {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [imageLoadError, setImageLoadError] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  
  // Format the timestamp to a readable date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };
  
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };
  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

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

  // Safety check for null/undefined post
  if (!post) {
    return null;
  }

  return (
    <View style={[styles.postContainer, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <Image 
            source={{ 
              uri: post.author?.avatar || 
                   post.author?.avatar_thumbnail                   
            } || require('@assets/images/favicon.png') }
            onLoadStart={() => handleImageLoadStart('avatar')}
            onLoad={() => handleImageLoadEnd('avatar')}
            onError={() => handleImageError('avatar')}
            resizeMode="cover" 
            style={styles.userAvatar} 
          />
          {imageLoading['avatar'] && (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator size="small" color={colors.accentColor} />
            </View>
          )}
          <View>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {post.author?.full_name || post.author?.username || 'Anonymous'}
            </Text>
            <Text style={[styles.postTime, { color: colors.textSecondary }]}>
              {formatDate(post.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.postOptions}>
          <TouchableOpacity onPress={toggleOptions} style={styles.optionsButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showOptions && (
            <View style={[styles.optionsDropdown, { backgroundColor: colors.backgroundSecondary }]}>
              <TouchableOpacity>
                <Text style={{ color: colors.textPrimary, padding: 10 }}>Ẩn bài viết</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={{ color: colors.textPrimary, padding: 10 }}>Lưu bài viết</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={{ color: colors.textPrimary, padding: 10 }}>Báo cáo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={styles.postBody}>
        {post.title && (
          <Text style={[styles.postTitle, { color: colors.accentColor }]}>{post.title}</Text>
        )}
        <Text style={[styles.postContent, { color: colors.textPrimary }]}>{post.content}</Text>
        
        {/* Thay thế phần Images bằng component ImageGallery */}
        {post.media && post.media.length > 0 && (
          <ImageGallery mediaItems={post.media} />
        )}
        
        {/* Location info if available */}
        {post.address && (
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{post.address}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.postFooter}>
        <View style={[styles.interactionBar, { borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity 
            style={styles.interactionButton} 
            onPress={handleLike}
          >
            <Ionicons 
              name={liked ? "thumbs-up" : "thumbs-up-outline"} 
              size={20} 
              color={liked ? colors.accentColor : colors.textSecondary} 
            />
            <Text style={{ color: liked ? colors.accentColor : colors.textSecondary, marginLeft: 5 }}>
              {(post.interaction_count || 0) + (liked ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.interactionButton} 
            onPress={handleDislike}
          >
            <Ionicons 
              name={disliked ? "thumbs-down" : "thumbs-down-outline"} 
              size={20} 
              color={disliked ? colors.accentColor : colors.textSecondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginLeft: 5 }}>
              {post.comment_count || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginLeft: 5 }}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  postOptions: {
    position: 'relative',
  },
  optionsButton: {
    padding: 5,
  },
  optionsDropdown: {
    position: 'absolute',
    right: 0,
    top: 30,
    width: 120,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  postBody: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 10,
  },
  postMedia: {
    marginBottom: 12,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
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
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 13,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default PostItem;