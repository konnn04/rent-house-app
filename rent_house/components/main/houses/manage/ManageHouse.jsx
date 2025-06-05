import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge, Button, FAB, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { getMyHousesService } from '../../../../services/houseService';
import { HouseCard } from '../components/HouseCard';
import { ManageHeader } from './components/ManageHeader';

export const ManageHouse = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { userData } = useUser();
  
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statistics, setStatistics] = useState({
    totalHouses: 0,
    totalRooms: 0,
    availableRooms: 0,
    pendingVerifications: 0
  });
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Lấy thông tin đã xác thực hay chưa từ userData
  const isVerified = userData?.is_verified || false;
  const hasIdentity = userData?.has_identity || false;

  // Lấy danh sách nhà
  const fetchHouses = async (refresh = false) => {
    try {
      setError(null);
      if (!refresh && !refreshing) setLoading(true);

      let response;
      if (!refresh && nextPageUrl) {
        response = await getMyHousesService(nextPageUrl);
      } else {
        response = await getMyHousesService();
      }

      // Nếu có phân trang, response có thể là object với results, count, next
      const results = response.results || response.data?.results || [];
      const count = response.count || response.data?.count || 0;
      const next = response.next || response.data?.next || null;

      setNextPageUrl(next);

      setHouses(prev =>
        refresh ? results : [...(prev || []), ...results]
      );

      // Calculate statistics
      const totalHouses = count;
      let totalRooms = 0;
      let availableRooms = 0;

      results.forEach(house => {
        totalRooms += house.max_rooms || 0;
        const usedRooms = house.current_rooms || 0;
        availableRooms += Math.max(0, (house.max_rooms || 0) - usedRooms);
      });

      setStatistics({
        totalHouses,
        totalRooms,
        availableRooms,
        pendingVerifications: 0 // This will be updated from another API
      });

    } catch (err) {
      console.error('Error fetching houses:', err);
      setError('Không thể tải danh sách nhà. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHouses(true);
  }, []);
  
  // Focus listener để cập nhật lại dữ liệu khi quay lại màn hình này
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Tải lại thông tin người dùng để cập nhật trạng thái xác thực
      userData.fetchUserData && userData.fetchUserData();
      fetchHouses(true);
    });
    return unsubscribe;
  }, [navigation, fetchHouses, userData]);

  const handleRefresh = () => {
    setRefreshing(true);
    setNextPageUrl(null);
    fetchHouses(true);
  };

  const handleLoadMore = () => {
    if (loadingMore || !nextPageUrl) return;
    setLoadingMore(true);
    fetchHouses(false);
  };

  const handleSearch = () => {
    // Implement search functionality
    // For now, we'll just filter the houses by title
    if (!searchQuery.trim()) {
      fetchHouses();
      return;
    }
    
    const filtered = houses.filter(house => 
      house.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setHouses(filtered);
  };
  
  const handleVerifyIdentity = () => {
    navigation.navigate('IdentityVerification');
  };
  
  const handleAddHouse = () => {
    // Kiểm tra xem người dùng đã gửi thông tin xác thực chưa
    if (!hasIdentity && userData?.role === 'owner') {
      Alert.alert(
        'Xác thực danh tính',
        'Bạn cần xác thực danh tính trước khi thêm nhà mới.',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Xác thực ngay',
            onPress: () => navigation.navigate('IdentityVerification', { redirectAfter: 'AddHouse' })
          }
        ]
      );
    } else {
      navigation.navigate('AddHouse');
    }
  };
  
  const handleEditHouse = (house) => {
    navigation.navigate('EditHouse', { houseId: house.id });
  };
  
  const handleViewHouse = (house) => {
    navigation.navigate('HouseDetail', { houseId: house.id });
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="home-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Bạn chưa có nhà nào
      </Text>
      <Button 
        mode="contained" 
        onPress={handleAddHouse}
        style={[styles.addButton, { backgroundColor: colors.accentColor }]}
      >
        + Thêm nhà mới
      </Button>
    </View>
  );
  
  const renderVerificationBanner = () => {
    // Chỉ hiển thị banner cho người dùng là chủ nhà và chưa gửi thông tin xác thực
    if (userData?.role !== 'owner' || hasIdentity) return null;
    
    return (
      <TouchableOpacity 
        style={[styles.verificationBanner, { 
          backgroundColor: colors.backgroundSecondary,
          borderLeftWidth: 4,
          borderLeftColor: colors.accentColor
        }]}
        onPress={handleVerifyIdentity}
      >
        <Icon name="shield-alert" size={24} color={colors.accentColor} />
        <View style={styles.verificationBannerText}>
          <Text style={[styles.verificationTitle, { color: colors.textPrimary }]}>
            Xác thực danh tính
          </Text>
          <Text style={[styles.verificationSubtitle, { color: colors.textSecondary }]}>
            Bạn cần xác thực danh tính để đăng tin cho thuê nhà
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.accentColor} />
      </TouchableOpacity>
    );
  };
  
  const renderStatistics = () => (
    <View style={[styles.statsContainer, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{statistics.totalHouses}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Nhà</Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{statistics.totalRooms}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Phòng</Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.successColor }]}>{statistics.availableRooms}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Còn trống</Text>
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ManageHeader title="Quản lý nhà" />
      
      {renderVerificationBanner()}
      
      <Searchbar
        placeholder="Tìm kiếm nhà của bạn..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
        inputStyle={{ color: colors.textPrimary }}
        iconColor={colors.accentColor}
        placeholderTextColor={colors.textSecondary}
      />
      
      {!loading && houses.length > 0 && renderStatistics()}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
            Đang tải danh sách nhà...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchHouses}
            style={{ backgroundColor: colors.accentColor, marginTop: 10 }}
          >
            Thử lại
          </Button>
        </View>
      ) : (
        <FlatList
          data={houses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.houseCardContainer}
              onPress={() => handleViewHouse(item)}
              activeOpacity={0.8}
            >
              <HouseCard 
                house={item} 
                onPress={() => handleViewHouse(item)}
              />
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.accentColor }]}
                  onPress={() => handleEditHouse(item)}
                >
                  <Icon name="pencil" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.dangerColor }]}
                  onPress={() => handleEditHouse(item)}
                >
                  <Icon name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {!item.is_verified && (
                <Badge
                  style={[styles.verificationBadge, { backgroundColor: colors.dangerColor, color: '#fff' }]}
                >
                  Chưa xác thực
                </Badge>
              )}
              
              {item.is_active === false && (
                <Badge
                  style={[styles.statusBadge, { backgroundColor: colors.dangerColor }]}
                >
                  Ngừng hoạt động
                </Badge>
              )}
              
              {item.available_rooms === 0 && item.max_rooms > 0 && (
                <Badge
                  style={[styles.fullBadge, { backgroundColor: colors.infoColor }]}
                >
                  Đã cho thuê hết
                </Badge>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={[
            styles.listContentContainer,
            houses.length === 0 && styles.emptyList
          ]}
          ListEmptyComponent={renderEmptyState}
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
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreIndicator}>
                <ActivityIndicator size="small" color={colors.accentColor} />
                <Text style={{ color: colors.textSecondary, marginTop: 5 }}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: colors.accentColor }]}
        icon="plus"
        onPress={handleAddHouse}
        disabled={loading || (userData?.role === 'owner' && !hasIdentity)}
        color="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyList: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 8,
  },
  listContentContainer: {
    paddingBottom: 80,
    paddingHorizontal: 10,
  },
  houseCardContainer: {
    position: 'relative',
    marginHorizontal: 5,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 205,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    opacity: 0.8,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 155,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    opacity: 0.8,
  },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 40,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  verificationBannerText: {
    flex: 1,
    marginHorizontal: 10,
  },
  verificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  verificationSubtitle: {
    fontSize: 12,
  },
  verificationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 4,
    zIndex: 5,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 5,
  },
  fullBadge: {
    position: 'absolute',
    top: 40,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2,
  },
  loadMoreIndicator: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
