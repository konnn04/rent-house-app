import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { getPostDetailsService, interactWithPostService } from '../../../services/postService';
import { truncateText } from '../../../utils/Tools';
import { ImageGallery } from '../../common/ImageGallery';
import { CommentsModal } from './components/CommentsModal';

const HouseAttachment = ({ house, colors, onPress }) => {
  if (!house) return null;
  const formatPrice = (price) => parseFloat(price).toLocaleString('vi-VN');
  return (
    <View style={[styles.houseAttachment, { borderColor: colors.borderColor }]}>
      <Text style={[styles.houseAttachmentTitle, { color: colors.accentColor }]}>
        <MaterialCommunityIcons name="home-outline" size={16} color={colors.accentColor} /> Thông tin nhà
      </Text>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.houseContent}>
          {house.thumbnail && (
            <Image
              source={{ uri: house.thumbnail }}
              style={styles.houseThumbnail}
              resizeMode="cover"
            />
          )}
          <View style={styles.houseDetails}>
            <Text style={[styles.houseTitle, { color: colors.textPrimary }]}>{house.title}</Text>
            <View style={styles.houseInfoRow}>
              <Text style={[styles.houseInfo, { color: colors.textSecondary }]}>
                {formatPrice(house.base_price)} VNĐ/tháng
              </Text>
            </View>
            <View style={styles.houseInfoRow}>
              <Text style={[styles.houseInfo, { color: colors.textSecondary }]}>
                <MaterialCommunityIcons name="ruler-square" size={14} /> {house.area} m²
              </Text>
              <Text style={[styles.houseInfo, { color: colors.textSecondary }]}>
                <MaterialCommunityIcons name="door" size={14} /> {house.current_rooms}/{house.max_rooms} phòng
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const PostDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const postId = route.params?.postId || route.params?.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [interaction, setInteraction] = useState({ like_count: 0, type: 'none' });

  const fetchPostDetails = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await getPostDetailsService(postId);
      setPost(data);
      setInteraction({
        like_count: data.like_count || 0,
        type: data.interaction?.type || 'none'
      });
    } catch (err) {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  // Like/dislike logic (reuse from PostCard)
  const handleInteraction = async (type) => {
    if (!post) return;
    const newType = interaction.type === type ? 'none' : type;
    setInteraction(prev => ({ ...prev, type: newType }));
    try {
      const data = await interactWithPostService(post.id, newType);
      if (data) {
        setInteraction({
          like_count: data.like_count,
          type: data.type
        });
      }
    } catch {
      setInteraction({
        like_count: post.like_count || 0,
        type: post.interaction?.type || 'none'
      });
    }
  };
  const handleLike = () => handleInteraction('like');
  const handleDislike = () => handleInteraction('dislike');

  // Navigation
  const handleGoBack = () => navigation.goBack();
  const handleViewHouse = () => {
    if (post?.house_link?.id) {
      navigation.navigate('HouseDetail', { houseId: post.house_link.id });
    }
  };

  // Content expansion
  const MAX_CONTENT_LENGTH = 1000;
  const shouldTruncate = post?.content && post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = shouldTruncate && !isContentExpanded
    ? truncateText(post.content, MAX_CONTENT_LENGTH)
    : post?.content;

  // Format date
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary, flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary, flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.dangerColor }}>Không thể tải bài đăng.</Text>
        <TouchableOpacity onPress={fetchPostDetails} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.accentColor }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Chi tiết bài đăng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.postContainer, { backgroundColor: colors.backgroundSecondary }]}>
          {/* User info */}
          <View style={styles.postHeader}>
            <TouchableOpacity
              style={styles.postUserInfo}
              onPress={() => navigation.navigate('PublicProfile', { username: post.author?.username })}
            >
              <Image
                source={{
                  uri: post.author?.avatar || post.author?.avatar_thumbnail
                } || require('@assets/images/favicon.png')}
                style={styles.userAvatar}
              />
              <View>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                  {post.author?.full_name || post.author?.username || 'Anonymous'}
                </Text>
                <Text style={[styles.postTime, { color: colors.textSecondary }]}>
                  {formatDate(post.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Title */}
          {post.title && (
            <Text style={[styles.postTitle, { color: colors.accentColor }]}>{post.title}</Text>
          )}

          {/* Content */}
          <Text style={[styles.postContent, { color: colors.textPrimary }]}>
            {displayContent}
          </Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setIsContentExpanded(!isContentExpanded)}>
              <Text style={[styles.seeMoreButton, { color: colors.accentColor }]}>
                {isContentExpanded ? 'Thu gọn' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Images */}
          {post.media && post.media.length > 0 && (
            <ImageGallery mediaItems={post.media} />
          )}

          {/* Address (if not house_link) */}
          {(post.address && !post.house_link) && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>{post.address}</Text>
            </View>
          )}

          {/* House link */}
          {post.house_link && (
            <HouseAttachment
              house={post.house_link}
              colors={colors}
              onPress={handleViewHouse}
            />
          )}

          {/* Like/Dislike/Comment/Share */}
          <View style={styles.postFooter}>
            <View style={[styles.interactionBar, { borderBottomColor: colors.borderColor }]}>
              <TouchableOpacity style={styles.interactionButton} onPress={handleLike}>
                <Ionicons
                  name={interaction.type === 'like' ? "thumbs-up" : "thumbs-up-outline"}
                  size={20}
                  color={interaction.type === 'like' ? colors.accentColor : colors.textSecondary}
                />
                <Text style={{
                  color: interaction.type === 'like' ? colors.accentColor : colors.textSecondary,
                  marginLeft: 5
                }}>
                  {interaction.like_count || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.interactionButton} onPress={handleDislike}>
                <Ionicons
                  name={interaction.type === 'dislike' ? "thumbs-down" : "thumbs-down-outline"}
                  size={20}
                  color={interaction.type === 'dislike' ? colors.accentColor : colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.interactionButton} onPress={() => setCommentModalVisible(true)}>
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
      </ScrollView>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        postId={post.id}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContainer: {
    borderRadius: 12,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
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
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
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
  seeMoreButton: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
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
  postFooter: {
    marginTop: 10,
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
  // House attachment styles (reuse from PostCard)
  houseAttachment: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  houseAttachmentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  houseContent: {
    flexDirection: 'row',
  },
  houseThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginRight: 12,
  },
  houseDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  houseTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  houseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  houseInfo: {
    fontSize: 13,
    paddingRight: 4,
  },
});