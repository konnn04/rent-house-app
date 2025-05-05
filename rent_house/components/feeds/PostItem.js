import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const PostItem = ({ post }) => {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
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

  return (
    <View style={[styles.postContainer, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <Image 
            source={{ uri: post.author.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.userAvatar} 
          />
          <View>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{post.author.name}</Text>
            <Text style={[styles.postTime, { color: colors.textSecondary }]}>{post.createdAt}</Text>
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
        <Text style={[styles.postContent, { color: colors.textPrimary }]}>{post.content}</Text>
        
        {/* Images or Videos */}
        {post.media && post.media.length > 0 && (
          <View style={styles.postMedia}>
            {post.media.map((item, index) => (
              <Image 
                key={index} 
                source={{ uri: item.url }} 
                style={styles.postImage}
                resizeMode="cover" 
              />
            ))}
          </View>
        )}
        
        {/* Room Attachment */}
        {post.roomInfo && (
          <View style={[styles.roomAttachment, { borderColor: colors.borderColor }]}>
            <Text style={[styles.roomTitle, { color: colors.accentColor }]}>{post.roomInfo.title}</Text>
            <View style={styles.roomDetails}>
              <Text style={{ color: colors.textPrimary }}><Text style={{ fontWeight: 'bold' }}>Địa chỉ:</Text> {post.roomInfo.address}</Text>
              <Text style={{ color: colors.textPrimary }}><Text style={{ fontWeight: 'bold' }}>Giá:</Text> {post.roomInfo.price.toLocaleString('vi-VN')} đồng/tháng</Text>
              <Text style={{ color: colors.textPrimary }}><Text style={{ fontWeight: 'bold' }}>Diện tích:</Text> {post.roomInfo.area} m²</Text>
              {post.roomInfo.features && (
                <View style={styles.roomFeatures}>
                  <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>Tiện ích:</Text>
                  {post.roomInfo.features.map((feature, index) => (
                    <Text key={index} style={{ color: colors.textPrimary, marginLeft: 10 }}>• {feature}</Text>
                  ))}
                </View>
              )}
            </View>
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
              {post.likes + (liked ? 1 : 0)}
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
            <Text style={{ color: disliked ? colors.accentColor : colors.textSecondary, marginLeft: 5 }}>
              {post.dislikes + (disliked ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginLeft: 5 }}>
              {post.comments.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginLeft: 5 }}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
        
        {/* Featured Comments - limit to 2 for mobile view */}
        {post.comments.length > 0 && (
          <View style={styles.featuredComments}>
            <Text style={[styles.commentsTitle, { color: colors.textSecondary }]}>Bình luận nổi bật</Text>
            {post.comments.slice(0, 2).map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Image 
                  source={{ uri: comment.author.avatar || 'https://via.placeholder.com/30' }} 
                  style={styles.commentAvatar} 
                />
                <View style={[styles.commentContent, { backgroundColor: colors.backgroundPrimary }]}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>{comment.author.name}</Text>
                    <Text style={[styles.commentTime, { color: colors.textSecondary }]}>{comment.createdAt}</Text>
                  </View>
                  <Text style={[styles.commentText, { color: colors.textPrimary }]}>{comment.text}</Text>
                </View>
              </View>
            ))}
            {post.comments.length > 2 && (
              <TouchableOpacity style={styles.viewMoreComments}>
                <Text style={{ color: colors.textSecondary }}>
                  Xem thêm {post.comments.length - 2} bình luận
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
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
  postContent: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 10,
  },
  postMedia: {
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  roomAttachment: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roomDetails: {
    gap: 5,
  },
  roomFeatures: {
    marginTop: 5,
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
  featuredComments: {
    marginTop: 12,
  },
  commentsTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 5,
  },
  commentTime: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 13,
    marginTop: 3,
  },
  viewMoreComments: {
    alignItems: 'center',
    marginTop: 5,
    padding: 8,
  },
});

export default PostItem;