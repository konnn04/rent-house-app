import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, IconButton, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';
import { getPostDetailsService } from '../../../services/postService';
import { timeAgo } from '../../../utils/Tools';
import { ImageGallery } from '../../common/ImageGallery';
import { CommentSection } from './components/CommentSection';
import { HouseLink } from './components/HouseLink';

export const PostDetail = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = useUser();
  
  const postId = route.params?.postId;
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  
  // Fetch post details
  const fetchPostDetails = useCallback(async () => {
    if (!postId) {
      setError('Missing post ID');
      setLoading(false);
      return;
    }
    
    try {
      if (!refreshing) setLoading(true);
      
      const data = await getPostDetailsService(postId);
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Không thể tải bài đăng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId, refreshing]);
  
  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPostDetails();
  };
  
  // Navigate back
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Show options menu
  const handleShowMenu = (event) => {
    const { nativeEvent } = event;
    setMenuAnchor({
      x: nativeEvent.pageX,
      y: nativeEvent.pageY,
    });
    setMenuVisible(true);
  };
  
  // Handle share post
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}`,
        title: post.title,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };
  
  // Handle like post
  const handleLike = async () => {
    try {
      if (post.liked) {
        await api.post(`/api/posts/${postId}/unlike/`);
        setPost({
          ...post,
          liked: false,
          likes_count: Math.max(0, post.likes_count - 1)
        });
      } else {
        await api.post(`/api/posts/${postId}/like/`);
        setPost({
          ...post,
          liked: true,
          likes_count: post.likes_count + 1
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Lỗi', 'Không thể thích bài đăng. Vui lòng thử lại sau.');
    }
  };
  
  // Navigate to user profile
  const handleUserPress = () => {
    if (post?.author) {
      navigation.navigate('PublicProfile', { username: post.author.username });
    }
  };
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundPrimary }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.textPrimary}
            onPress={handleGoBack}
          />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Chi tiết bài đăng</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải...</Text>
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundPrimary }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.textPrimary}
            onPress={handleGoBack}
          />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Chi tiết bài đăng</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchPostDetails}
            style={{ backgroundColor: colors.accentColor, marginTop: 20 }}
          >
            Thử lại
          </Button>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundPrimary }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.textPrimary}
          onPress={handleGoBack}
        />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Chi tiết bài đăng</Text>
        <IconButton
          icon="share-variant"
          size={24}
          iconColor={colors.textPrimary}
          onPress={handleShare}
        />
      </View>
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.accentColor]}
            tintColor={colors.accentColor}
          />
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {post && (
          <View style={[styles.postContent, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Post Header - Author Info */}
            <View style={styles.postHeader}>
              <TouchableOpacity style={styles.postUserInfo} onPress={handleUserPress}>
                {post.author.avatar ? (
                  <Image source={{ uri: post.author.avatar }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatar, { backgroundColor: colors.accentColor }]}>
                    <Text style={styles.avatarText}>{post.author.full_name.charAt(0)}</Text>
                  </View>
                )}
                <View>
                  <Text style={[styles.userName, { color: colors.textPrimary }]}>
                    {post.author.full_name}
                  </Text>
                  <Text style={[styles.postTime, { color: colors.textSecondary }]}>
                    {timeAgo(post.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionsButton} 
                onPress={handleShowMenu}
              >
                <Icon name="dots-vertical" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={menuAnchor}
                contentStyle={{ backgroundColor: colors.backgroundPrimary }}
              >
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    handleShare();
                  }} 
                  title="Chia sẻ"
                  leadingIcon="share-variant"
                  titleStyle={{ color: colors.textPrimary }}
                />
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    // Report functionality
                  }} 
                  title="Báo cáo"
                  leadingIcon="flag"
                  titleStyle={{ color: colors.dangerColor }}
                />
              </Menu>
            </View>
            
            {/* Post Title */}
            <Text style={[styles.postTitle, { color: colors.textPrimary }]}>
              {post.title}
            </Text>
            
            {/* Post Content */}
            <Text style={[styles.postContentText, { color: colors.textPrimary }]}>
              {post.content}
            </Text>
            
            {/* Post Media */}
            {post.media && post.media.length > 0 && (
              <View style={styles.postMedia}>
                <ImageGallery mediaItems={post.media} />
              </View>
            )}
            
            {/* Linked House if any */}
            {post.house_link && (
              <View style={styles.houseLink}>
                <HouseLink 
                  house={post.house_link} 
                  onRemove={null} 
                  readOnly={true}
                  colors={colors}
                />
              </View>
            )}

            {/* Post Location */}
            {post.address && (
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={16} color={colors.accentColor} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                  {post.address}
                </Text>
              </View>
            )}
            
            {/* Like/Comment Count */}
            <View style={[styles.statsContainer, { borderColor: colors.borderColor }]}>
              <Text style={{ color: colors.textSecondary }}>
                {post.likes_count} lượt thích • {post.comments_count} bình luận
              </Text>
            </View>
            
            {/* Actions Buttons */}
            <View style={[styles.actionsContainer, { borderColor: colors.borderColor }]}>
              <Button 
                icon={post.liked ? "thumb-up" : "thumb-up-outline"}
                mode="text"
                onPress={handleLike}
                style={styles.actionButton}
                labelStyle={{ color: post.liked ? colors.accentColor : colors.textSecondary }}
              >
                Thích
              </Button>
              
              <Button 
                icon="comment-outline"
                mode="text"
                style={styles.actionButton}
                labelStyle={{ color: colors.textSecondary }}
              >
                Bình luận
              </Button>
              
              <Button 
                icon="share-outline"
                mode="text"
                onPress={handleShare}
                style={styles.actionButton}
                labelStyle={{ color: colors.textSecondary }}
              >
                Chia sẻ
              </Button>
            </View>
          </View>
        )}
        
        {/* Comments Section */}
        {post && (
          <View style={[
            styles.commentsContainer, 
            { backgroundColor: colors.backgroundSecondary }
          ]}>
            <CommentSection postId={postId} />
          </View>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
  },
  postContent: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: '600',
    fontSize: 15,
  },
  postTime: {
    fontSize: 12,
  },
  optionsButton: {
    padding: 5,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  postContentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  postMedia: {
    marginBottom: 16,
  },
  houseLink: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
  },
  statsContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 8,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
  },
  commentsContainer: {
    margin: 12,
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
});