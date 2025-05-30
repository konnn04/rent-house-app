import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';
import { api } from '../../../utils/Fetch';
import { CommentSection } from './components/CommentSection';
import { PostHeader } from './components/PostHeader';
import { PostMedia } from './components/PostMedia';

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
      
      const response = await api.get(`/api/posts/${postId}/`);
      setPost(response.data);
      
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
          <IconButton
            icon="alert-circle-outline" 
            size={50} 
            iconColor={colors.dangerColor} 
          />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
            onPress={fetchPostDetails}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
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
        <IconButton
          icon="share-variant"
          size={24}
          iconColor={colors.textPrimary}
          onPress={handleShare}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.accentColor]}
              tintColor={colors.accentColor}
            />
          }
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {post && (
            <>
              <PostHeader 
                post={post} 
                onUserPress={handleUserPress} 
                onOptionsPress={handleShowMenu}
                colors={colors}
              />
              
              <View style={styles.postContent}>
                {post.title && (
                  <Text style={[styles.postTitle, { color: colors.accentColor }]}>
                    {post.title}
                  </Text>
                )}
                
                <Text style={[styles.postText, { color: colors.textPrimary }]}>
                  {post.content}
                </Text>
                
                {post.media && post.media.length > 0 && (
                  <PostMedia media={post.media} colors={colors} />
                )}
                
                {post.address && (
                  <View style={styles.locationContainer}>
                    <IconButton
                      icon="map-marker"
                      size={20}
                      iconColor={colors.textSecondary}
                      style={styles.locationIcon}
                    />
                    <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                      {post.address}
                    </Text>
                  </View>
                )}
                
                {post.house_link && (
                  <View style={[styles.houseLink, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[styles.houseLinkTitle, { color: colors.textPrimary }]}>
                      Liên kết với:
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('HouseDetail', { houseId: post.house_link.id })}
                    >
                      <Text style={[styles.houseLinkText, { color: colors.accentColor }]}>
                        {post.house_link.title}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <View style={[styles.separator, { backgroundColor: colors.borderColor }]} />
              
              <View style={styles.commentsContainer}>
                <Text style={[styles.commentsTitle, { color: colors.textPrimary }]}>
                  Bình luận ({post.comment_count || 0})
                </Text>
                
                <CommentSection 
                  postId={post.id}
                  colors={colors}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    height: 60,
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
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  postContent: {
    padding: 15,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationIcon: {
    margin: 0,
    marginRight: -5,
  },
  locationText: {
    fontSize: 14,
  },
  houseLink: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
  },
  houseLinkTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  houseLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    marginVertical: 10,
  },
  commentsContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    flex: 1,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});