import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { homeStyles, styles } from '../../styles/style';
import { api } from '../../utils/Fetch';
import { NewPostSample } from '../posts/NewPostSample';
import { PostCard } from '../posts/PostCard';

export const FeedList = () => {
  const { colors } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  
  // Initial load
  useEffect(() => {
    loadPosts();
  }, []);
  
  const loadPosts = async (refresh = false) => {
    try {
      if ((loading && !refresh) || loadingMore) return;
      
      let url = 'api/new-feed/';
      
      // If not refreshing and we have a next page URL, use that
      if (!refresh && nextPageUrl) {
        try {
          // Extract just the query parameters
          const urlObj = new URL(nextPageUrl);
          const queryParams = urlObj.search.substring(1); // Remove the leading '?'
          if (queryParams) {
            url = `api/new-feed/?${queryParams}`;
          }
        } catch (e) {
          console.error('Failed to parse next page URL:', e);
        }
      }
      
      const response = await api.get(url);
      const newData = response.data || {};
      
      // Update next page URL for pagination
      setNextPageUrl(newData.next || null);
      
      // Ensure results is an array
      const results = Array.isArray(newData.results) ? newData.results : [];
      
      // If refreshing, replace posts; otherwise, append
      setPosts(prevPosts => refresh ? results : [...prevPosts, ...results]);
      
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };
  
  // Handle refresh (pull down)
  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };
  
  // Handle loading more (pagination)
  const handleLoadMore = () => {
    if (loadingMore || !nextPageUrl) return;
    
    setLoadingMore(true);
    loadPosts(false);   
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={homeStyles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginLeft: 10 }}>Đang tải...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={homeStyles.headerContainer}>
        <View style={homeStyles.headerTop}>
          <Image
            source={require('@assets/images/favicon.png')}
            style={homeStyles.logo}
          />
          <Text style={[homeStyles.title, { color: colors.textPrimary }]}>
            Trang chủ
          </Text>
        </View>
      </View>

      {/* Tạo bài viết */}
      
      
      {loading ? (
        
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải bài viết...</Text>
        </View>
      ) : (
        <FlatList
          
          data={posts || []}
          keyExtractor={item => item?.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={homeStyles.postsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.accentColor]}
              tintColor={colors.accentColor}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={NewPostSample}
          ListEmptyComponent={
            <View style={homeStyles.emptyContainer}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Không có bài viết nào.
              </Text>
            </View>
          }
          style={homeStyles.postsList}
        />
      )}
    </View>
  );
};
