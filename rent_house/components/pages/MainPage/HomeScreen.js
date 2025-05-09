import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateMockPosts } from '../../../data/mockPosts';
import { styles, homeStyles } from '../../../styles/style';
import PostItem from '../../feeds/PostItem';

const POSTS_PER_PAGE = 5;

const HomeScreen = () => {
  const { theme, toggleTheme, colors } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Initial load
  useEffect(() => {
    loadPosts();
  }, []);
  
  // Simulated fetch from API
  const loadPosts = async (refresh = false) => {
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const allPosts = generateMockPosts(50);
      const currentPage = refresh ? 1 : page;
      const newPosts = allPosts.slice(0, currentPage * POSTS_PER_PAGE);
      
      setPosts(newPosts);
      setPage(currentPage);
      setHasMore(newPosts.length < allPosts.length);
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
    setPage(1);
    loadPosts(true);
  };
  
  // Handle loading more (pagination)
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setPage(prevPage => prevPage + 1);
    loadPosts();
  };
  
  // Render footer (loading indicator)
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
          <Text style={[homeStyles.title, { color: colors.textPrimary }]}>
            RENT HOUSE
          </Text>
          <TouchableOpacity onPress={toggleTheme} style={homeStyles.themeButton}>
            <Ionicons 
              name={theme === 'dark' ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.textPrimary} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={homeStyles.themeButton}>
            <Ionicons 
              name={theme === 'dark' ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.textPrimary} 
            />
          </TouchableOpacity>
        </View>
        <Text style={[homeStyles.greeting, { color: colors.textPrimary }]}>
          Xin chào
        </Text>
        <View style={[homeStyles.searchContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderColor}]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[homeStyles.searchInput, { color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
            placeholder="Bạn tìm nhà sao ?"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
      
      {loading ? (
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải bài viết...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PostItem post={item} />}
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
        />
      )}
    </View>
  );
};

export default HomeScreen;