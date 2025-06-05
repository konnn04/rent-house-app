import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Chip, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../../contexts/ThemeContext";
import { searchPostsService } from "../../../services/postService";
import { searchUsersService } from "../../../services/userService";
import { PostCard } from "../posts/PostCard";
import { UserListItem } from "./components/UserListItem";

export const SearchScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState(null); 

  const postTypes = [
    { value: null, label: 'Tất cả' },
    { value: 'general', label: 'Bài viết thông thường' },
    { value: 'rental_listing', label: 'Cho thuê phòng trọ' },
    { value: 'search_listing', label: 'Tìm phòng trọ' },
    { value: 'roommate', label: 'Tìm bạn ở ghép' },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [activeTab, selectedPostType]); 

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    setResults([]);
    
    try {
      let data;
      if (activeTab === 'posts') {
        data = await searchPostsService(searchQuery, null, selectedPostType);
      } else {
        data = await searchUsersService(searchQuery);
      }
      
      setResults(data.results || []);
      setNextPageUrl(data.next);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageUrl || loadingMore) return;
    
    setLoadingMore(true);
    
    try {
      let data;
      if (activeTab === 'posts') {
        data = await searchPostsService(null, nextPageUrl, selectedPostType);
      } else {
        data = await searchUsersService(null, nextPageUrl);
      }
      
      setResults(prev => [...prev, ...(data.results || [])]);
      setNextPageUrl(data.next);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setResults(prev => prev.filter(item => item.id !== deletedPostId));
  };

  const renderPostItem = ({ item }) => (
    <PostCard post={item} onPostDeleted={handlePostDeleted} />
  );

  const renderUserItem = ({ item }) => (
    <UserListItem user={item} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Tìm kiếm..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              onSubmitEditing={handleSearch}
              style={styles.searchBar}
              inputStyle={{ color: colors.textPrimary }}
              iconColor={colors.textSecondary}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton, 
              activeTab === 'posts' && styles.activeTab,
              activeTab === 'posts' && { borderBottomColor: colors.accentColor }
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'posts' ? colors.accentColor : colors.textSecondary }
            ]}>
              Bài viết
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton, 
              activeTab === 'users' && styles.activeTab,
              activeTab === 'users' && { borderBottomColor: colors.accentColor }
            ]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'users' ? colors.accentColor : colors.textSecondary }
            ]}>
              Người dùng
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'posts' && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {postTypes.map((type) => (
              <Chip
                key={type.value || 'all'}
                selected={selectedPostType === type.value}
                onPress={() => setSelectedPostType(type.value)}
                style={[
                  styles.filterChip,
                  selectedPostType === type.value && { backgroundColor: colors.accentColorLight }
                ]}
                textStyle={{ 
                  color: selectedPostType === type.value ? colors.accentColor : colors.textPrimary 
                }}
              >
                {type.label}
              </Chip>
            ))}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
        </View>
      ) : results.length === 0 && hasSearched ? (
        <View style={styles.centerContainer}>
          <Icon name="magnify" size={50} color={colors.textSecondary} />
          <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
            Không tìm thấy kết quả
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={activeTab === 'posts' ? renderPostItem : renderUserItem}
          keyExtractor={(item) => (activeTab === 'posts' ? `post-${item.id}` : `user-${item.id}`)}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.accentColor} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
  },
  searchBar: {
    borderRadius: 10,
    elevation: 0,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
    marginVertical: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  listContainer: {
    padding: 8,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
