import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { getFeedService } from "../../../services/feedService";
import { homeStyles, styles } from "../../../styles/style";
import { NewPostSample } from "../posts/NewPostSample";
import { PostCard } from "../posts/PostCard";
import { deletePostService } from "../../../services/postService";

export const FeedList = () => {
  const { colors } = useTheme();
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
  // Chỉ cần update state, không cần gọi service
  setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
};

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
          keyExtractor={(item) =>
            item?.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              key={item.id}
              onPostDeleted={handlePostDeleted}
            />
          )}
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
              <Text
                style={{ color: colors.textSecondary, textAlign: "center" }}
              >
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
