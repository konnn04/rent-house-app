import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [isVerified, setIsVerified] = useState(true);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
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
    navigation.navigate('AddHouse');
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
  
  const renderVerificationBanner = () => (
    !isVerified && (
      <TouchableOpacity 
        style={[styles.verificationBanner, { backgroundColor: colors.warningLight }]}
        onPress={handleVerifyIdentity}
      >
        <Icon name="shield-alert" size={24} color={colors.warningDark} />
        <View style={styles.verificationBannerText}>
          <Text style={[styles.verificationTitle, { color: colors.warningDark }]}>
            Xác thực danh tính
          </Text>
          <Text style={[styles.verificationSubtitle, { color: colors.warningDark }]}>
            Bạn cần xác thực danh tính để đăng tin cho thuê nhà
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.warningDark} />
      </TouchableOpacity>
    )
  );
  
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
              
              {!item.is_verified && (
                <Badge
                  style={[styles.verificationBadge, { backgroundColor: colors.warningColor }]}
                >
                  Chưa xác thực
                </Badge>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={houses.length === 0 && styles.emptyList}
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
              <View style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.accentColor} />
                <Text style={{ color: colors.textSecondary, marginTop: 5 }}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
        />
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: colors.accentColor }]}
        icon="plus"
        onPress={handleAddHouse}
        disabled={loading}
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
  },
  houseCardContainer: {
    position: 'relative',
    marginHorizontal: 10,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  editButton: {
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 50,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  }
});
