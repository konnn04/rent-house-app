import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from "../../../contexts/UserContext";
import { } from "../../../services/feedService";
import { } from "../../../services/houseService";
import {
  followUserService,
  getUserHouseService,
  getUserPostsService,
  getUserProfileService,
  unfollowUserService
} from '../../../services/profileService';
import { createDirectChat } from '../../../utils/ChatUtils';
import { timeAgo } from '../../../utils/Tools';
import { HouseMiniCard } from '../houses/components/HouseMiniCard';
import { PostCard } from '../posts/PostCard';

// Lấy chiều rộng màn hình để tính toán layout 2 cột
const { width } = Dimensions.get('window');

export const PublicProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const username = route.params?.username;

  const { colors } = useTheme();
  const { userData } = useUser();

  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'houses'
  const [isFollowing, setIsFollowing] = useState(false);
  const [messageButtonLoading, setMessageButtonLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      // Fetch profile data
      const profileData = await getUserProfileService(username);
      setProfileData(profileData);
      setIsFollowing(profileData.is_followed || false);

      // Fetch posts
      const postsResponse = await getUserPostsService(username);
      setPosts(postsResponse?.results || []);

      // If user is owner, fetch houses
      if (profileData.role === 'owner') {
        const housesResponse = await getUserHouseService(username);
        setHouses(housesResponse?.results || []);
      }

    } catch (err) {
      console.error('Error fetching profile data:', err);

      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [username, refreshing]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Unfollow the user
        await unfollowUserService(profileData.id);
        setIsFollowing(false);
        setProfileData(prev => ({
          ...prev,
          follower_count: Math.max(0, prev.follower_count - 1)
        }));
      } else {
        // Follow the user
        await followUserService(profileData.id);
        setIsFollowing(true);
        setProfileData(prev => ({
          ...prev,
          follower_count: prev.follower_count + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      setError(error.response?.data?.detail || 'Không thể thực hiện thao tác này. Vui lòng thử lại sau.');
    }
  };

  const handleMessageUser = async () => {
    if (!profileData || !profileData.id) return;
    
    setMessageButtonLoading(true);
    await createDirectChat(
      profileData.id, 
      profileData.full_name,
      navigation, 
      setMessageButtonLoading
    );
  };

  // Hàm mở ứng dụng điện thoại để gọi
  const handlePhoneCall = () => {
    if (profileData?.phone_number) {
      Linking.openURL(`tel:${profileData.phone_number}`);
    }
  };

  // Hàm mở ứng dụng email
  const handleEmail = () => {
    if (profileData?.email) {
      Linking.openURL(`mailto:${profileData.email}`);
    }
  };

  // Hàm mở bản đồ với địa chỉ
  const handleOpenMap = () => {
    if (profileData?.address) {
      // Encode địa chỉ cho URL bản đồ
      const encodedAddress = encodeURIComponent(profileData.address);
      Linking.openURL(`https://maps.google.com/maps?q=${encodedAddress}`);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông tin người dùng</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
            onPress={fetchProfileData}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Icon name="account-question" size={50} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Không tìm thấy người dùng</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.accentColor]}
            tintColor={colors.accentColor}
          />
        }
      >
        {/* Profile header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileData.avatar }}
              style={styles.profileImage}
              defaultSource={require('@assets/images/default-avatar.png')}
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.fullName, { color: colors.textPrimary }]}>{profileData.full_name}
              <Icon
                name={profileData.is_verified ? 'check-circle' : 'account'}
                size={16}
                color={profileData.is_verified ? colors.successColor : colors.textSecondary}
              />
            </Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>@{profileData.username}</Text>

            <View style={styles.roleContainer}>
              <Icon
                name={profileData.role === 'owner' ? 'home-city' : 'account'}
                size={16}
                color={colors.accentColor}
              />
              <Text style={[styles.roleText, { color: colors.textSecondary }]}>
                {profileData.role === 'owner' ? 'Chủ nhà' : 'Người thuê'}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{profileData.post_count}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bài đăng</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{profileData.follower_count}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Người theo dõi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{profileData.following_count}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Đang theo dõi</Text>
              </View>
            </View>

            {profileData?.username !== userData?.username && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.followButton, { backgroundColor: isFollowing ? colors.accentColor : colors.accentColor }]}
                  onPress={handleFollowToggle}
                >
                  <Icon
                    name={isFollowing ? 'account-check' : 'account-plus'}
                    size={18}
                    color={isFollowing ? 'white' : colors.textPrimary}
                  />
                  <Text style={[styles.followButtonText, { color: isFollowing ? 'white' : colors.textPrimary }]}>
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.messageButton, { borderColor: colors.accentColor }]}
                  onPress={handleMessageUser}
                  disabled={messageButtonLoading}
                >
                  {messageButtonLoading ? (
                    <ActivityIndicator size="small" color={colors.accentColor} />
                  ) : (
                    <Text style={[styles.messageButtonText, { color: colors.accentColor }]}>Nhắn tin</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* About section - Đã cập nhật phần này với các nút tương tác */}
        <View style={[styles.aboutSection, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Thông tin</Text>

          <View style={styles.infoRow}>
            <Icon name="email-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>{profileData.email}</Text>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.accentColor }]} 
              onPress={handleEmail}
            >
              <Icon name="email-send-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Gửi mail</Text>
            </TouchableOpacity>
          </View>

          {profileData.phone_number && (
            <View style={styles.infoRow}>
              <Icon name="phone-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]}>{profileData.phone_number}</Text>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.accentColor }]} 
                onPress={handlePhoneCall}
              >
                <Icon name="phone" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Gọi ngay</Text>
              </TouchableOpacity>
            </View>
          )}

          {profileData.address && (
            <View style={styles.infoRow}>
              <Icon name="map-marker-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]}>{profileData.address}</Text>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.accentColor }]} 
                onPress={handleOpenMap}
              >
                <Icon name="map" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Bản đồ</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Tham gia từ {timeAgo(profileData.joined_date)}
            </Text>
          </View>

          {profileData.role === 'owner' && profileData.avg_rating !== null && (
            <View style={styles.infoRow}>
              <Icon name="star" size={18} color="#FFD700" />
              <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                {profileData.avg_rating.toFixed(1)} sao đánh giá
              </Text>
            </View>
          )}

          {profileData.role === 'owner' && profileData.house_count !== null && (
            <View style={styles.infoRow}>
              <Icon name="home-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                {profileData.house_count} nhà/căn hộ
              </Text>
            </View>
          )}
        </View>

        {/* Tab navigation */}
        <View style={[styles.tabContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'posts' && { borderBottomColor: colors.accentColor, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'posts' ? colors.accentColor : colors.textSecondary }
              ]}
            >
              Bài đăng
            </Text>
          </TouchableOpacity>

          {profileData.role === 'owner' && (
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'houses' && { borderBottomColor: colors.accentColor, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab('houses')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'houses' ? colors.accentColor : colors.textSecondary }
                ]}
              >
                Nhà cho thuê
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab content */}
        {activeTab === 'posts' ? (
          <View style={styles.contentContainer}>
            {posts.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="post-outline" size={50} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Chưa có bài đăng nào
                </Text>
              </View>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {houses.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="home-outline" size={50} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Chưa có nhà/căn hộ nào
                </Text>
              </View>
            ) : (
              // Thay thế cách hiển thị trước đây bằng grid 2 cột
              <View style={styles.housesGrid}>
                {houses.map((house, index) => (
                  <View key={house.id} style={styles.houseCardContainer}>
                    <HouseMiniCard
                      house={house}
                      onPress={() => navigation.navigate('HouseDetail', { houseId: house.id })}
                    />
                  </View>
                ))}
              </View>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 30,
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
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileHeader: {
    padding: 16,
    flexDirection: 'row',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    marginRight: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  followButtonText: {
    fontWeight: '500',
  },
  messageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
  },
  messageButtonText: {
    fontWeight: '500',
  },
  aboutSection: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    marginTop: 16,
    paddingBottom: 40,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
  },
  housesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  houseCardContainer: {
    width: (width - 28) / 2, 
    marginBottom: 16,
  },
});