import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useUser } from '../../../../contexts/UserContext';
import { api } from '../../../../utils/Fetch';
import { CommentItem } from './CommentItem';

export const CommentsModal = ({ visible, onClose, postId, colors }) => {
  const { userData } = useUser();
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Fetch comments for the post
  const fetchComments = useCallback(async (pageNum = 1, loadMore = false) => {
    if (!postId) return;
    
    try {
      if (!loadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await api.get(`/api/comments/post_comments/?post_id=${postId}&page=${pageNum}`);
      
      if (response.data.results) {
        if (loadMore) {
          setComments(prev => [...prev, ...response.data.results]);
        } else {
          setComments(response.data.results);
        }
        
        setHasMorePages(!!response.data.next);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [postId]);
  
  // Load comments when modal opens
  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    }
  }, [visible, postId, fetchComments]);
  
  // Handle refresh (pull to refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchComments(1, false);
  };
  
  // Load more comments when scrolling
  const handleLoadMore = () => {
    if (hasMorePages && !loadingMore) {
      fetchComments(page + 1, true);
    }
  };
  
  // Handle posting a new comment
  const handlePostComment = async () => {
    if ((!newComment.trim() && selectedImages.length === 0) || submitting) return;
    
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('post', postId);
      formData.append('content', newComment.trim());
      
      if (replyingTo) {
        formData.append('parent', replyingTo.id);
      }
      
      // Add images if any
      selectedImages.forEach((image, index) => {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('images', {
          uri: image.uri,
          name: `image_${index}.${fileType}`,
          type: `image/${fileType}`,
        });
      });
      
      const response = await api.post('/api/comments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add new comment to the list
      if (replyingTo) {
        // Update the reply count for the parent comment
        setComments(prev => 
          prev.map(comment => 
            comment.id === replyingTo.id 
              ? { ...comment, reply_count: (comment.reply_count || 0) + 1 }
              : comment
          )
        );
      } else {
        // Add to beginning of the list if it's a top-level comment
        setComments(prev => [response.data, ...prev]);
      }
      
      // Clear input
      setNewComment('');
      setSelectedImages([]);
      setReplyingTo(null);
      
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle replying to a comment
  const handleReply = (comment) => {
    setReplyingTo(comment);
  };
  
  // Cancel replying
  const handleCancelReply = () => {
    setReplyingTo(null);
  };
  
  // Pick images from gallery
  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('We need camera roll permissions to add images');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Only add up to 5 images total
        const newImages = result.assets.map(asset => ({ uri: asset.uri }));
        setSelectedImages(prev => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, 5); // Limit to 5 images
        });
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };
  
  // Remove an image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Render the thumbnail previews of selected images
  const renderImagePreviews = () => {
    if (selectedImages.length === 0) return null;
    
    return (
      <View style={styles.imagePreviews}>
        {selectedImages.map((image, index) => (
          <View key={index} style={styles.imagePreviewContainer}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={[styles.removeImageButton, { backgroundColor: colors.dangerColor }]}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundPrimary }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.borderColor }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Bình luận</Text>
                <View style={{ width: 24 }} />
              </View>
              
              {/* Comments List */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.accentColor} />
                  <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
                    Đang tải bình luận...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <CommentItem
                      comment={item}
                      onReply={handleReply}
                      colors={colors}
                      postId={postId}
                    />
                  )}
                  style={styles.commentsList}
                  contentContainerStyle={styles.commentsListContent}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={{ color: colors.textSecondary }}>
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                      </Text>
                    </View>
                  }
                  ListFooterComponent={
                    loadingMore ? (
                      <View style={styles.loadingMoreContainer}>
                        <ActivityIndicator size="small" color={colors.accentColor} />
                      </View>
                    ) : null
                  }
                />
              )}
              
              {/* Reply indicator */}
              {replyingTo && (
                <View style={[styles.replyingContainer, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={{ color: colors.textSecondary }}>
                    Đang trả lời <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{replyingTo.author.full_name}</Text>
                  </Text>
                  <TouchableOpacity onPress={handleCancelReply}>
                    <Ionicons name="close" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Selected images preview */}
              {renderImagePreviews()}
              
              {/* Comment input */}
              <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <TouchableOpacity onPress={pickImages} style={styles.addImageButton}>
                  <Ionicons name="image" size={24} color={colors.accentColor} />
                </TouchableOpacity>
                
                <TextInput
                  style={[styles.commentInput, { color: colors.textPrimary }]}
                  placeholder="Viết bình luận của bạn..."
                  placeholderTextColor={colors.textSecondary}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                
                <TouchableOpacity 
                  style={[
                    styles.sendButton, 
                    { 
                      backgroundColor: 
                        submitting || (!newComment.trim() && selectedImages.length === 0)
                          ? colors.disabledColor
                          : colors.accentColor
                    }
                  ]}
                  onPress={handlePostComment}
                  disabled={submitting || (!newComment.trim() && selectedImages.length === 0)}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    padding: 15,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreContainer: {
    padding: 10,
    alignItems: 'center',
  },
  replyingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10, // Extra padding for iOS
  },
  addImageButton: {
    padding: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviews: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 5,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
