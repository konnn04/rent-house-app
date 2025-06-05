import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../../contexts/ThemeContext";
import { getFeedService } from "../../../services/feedService";
import { homeStyles, styles } from "../../../styles/style";
import { NewPostSample } from "../posts/NewPostSample";
import { PostCard } from "../posts/PostCard";

export const FeedList = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (refresh = false) => {
    try {
      if ((loading && !refresh) || loadingMore) return;

      let newData = {};

      if (!refresh && nextPageUrl) {
        newData = await getFeedService(nextPageUrl);
      } else {
        setLoading(true);
        newData = await getFeedService();
      }

      setNextPageUrl(newData.next || null);

      const results = Array.isArray(newData.results) ? newData.results : [];

      setPosts((prevPosts) => (refresh ? results : [...prevPosts, ...results]));
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };

  const handleLoadMore = () => {
    if (loadingMore || !nextPageUrl) return;
    setLoadingMore(true);
    loadPosts(false);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId));
  };

  const handleSearchPress = () => {
    navigation.navigate("SearchScreen");
  };

  const getItemLayout = (data, index) => ({
    length: 400,
    offset: 400 * index,
    index,
  });

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={homeStyles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginLeft: 10 }}>
          Đang tải...
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
    >
      <View style={homeStyles.headerContainer}>
        <View style={homeStyles.headerTop}>
          <Image
            source={require("@assets/images/favicon.png")}
            style={homeStyles.logo}
          />
          <Text style={[homeStyles.title, { color: colors.textPrimary }]}>
            Trang chủ
          </Text>
          <TouchableOpacity
            style={homeStyles.searchButton}
            onPress={handleSearchPress}
          >
            <Icon name="magnify" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
            Đang tải bài viết...
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts || []}
          keyExtractor={(item, index) => item.id.toString() + index}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPostDeleted={handlePostDeleted}
            />
          )}
          contentContainerStyle={[homeStyles.postsList, { paddingHorizontal:8 }]}
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
              <Text
                style={{ color: colors.textSecondary, textAlign: "center" }}
              >
                Không có bài viết nào.
              </Text>
            </View>
          }
          style={homeStyles.postsList}
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          windowSize={7}
          maxToRenderPerBatch={7}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};


