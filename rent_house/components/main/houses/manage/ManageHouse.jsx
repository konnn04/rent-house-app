import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge, Button, FAB, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { deleteHouseService, getMyHousesService } from '../../../../services/houseService';
import { PaperDialog } from '../../../common/PaperDialog';
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
  
  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });
  
  const isVerified = userData?.is_verified || false;
  const hasIdentity = userData?.has_identity || false;

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

      const results = response.results || response.data?.results || [];
      const count = response.count || response.data?.count || 0;
      const next = response.next || response.data?.next || null;

      setNextPageUrl(next);

      setHouses(prev =>
        refresh ? results : [...(prev || []), ...results]
      );

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
        pendingVerifications: 0 
      });

    } catch (err) {
      console.error('Error fetching houses:', err);
      setError('Không thể tải danh sách nhà. Vui lòng thử lại sau.');
      setDialogContent({
        title: 'Lỗi',
        message: 'Không thể tải danh sách nhà. Vui lòng thử lại sau.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHouses(true);
  }, []);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
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
    if (!hasIdentity && userData?.role === 'owner') {
      setDialogContent({
        title: 'Xác thực danh tính',
        message: 'Bạn cần xác thực danh tính trước khi thêm nhà mới.',
        actions: [
          { label: 'Hủy', onPress: () => setDialogVisible(false), style: 'cancel' },
          { label: 'Xác thực ngay', onPress: () => { setDialogVisible(false); navigation.navigate('IdentityVerification', { redirectAfter: 'AddHouse' }); } }
        ]
      });
      setDialogVisible(true);
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

  const handleDeleteHouse = (house) => {
    setDialogContent({
      title: "Xác nhận xóa nhà",
      message: "Bạn có chắc chắn muốn xóa nhà này?",
      actions: [
        {
          label: "Hủy",
          onPress: () => setDialogVisible(false),
          style: "cancel"
        },
        {
          label: "Xóa",
          onPress: async () => {
            setDialogVisible(false);
            try {
              await deleteHouseService(house.id);
              setHouses(prev => prev.filter(h => h.id !== house.id));
              setDialogContent({
                title: "Thành công",
                message: "Nhà đã được xóa.",
                actions: [{ label: "OK", onPress: () => setDialogVisible(false) }]
              });
              setDialogVisible(true);
            } catch (err) {
              console.error("Error deleting house:", err);
              setDialogContent({
                title: "Lỗi",
                message: "Không thể xóa nhà. Vui lòng thử lại sau.",
                actions: [{ label: "OK", onPress: () => setDialogVisible(false) }]
              });
              setDialogVisible(true);
            }
          },
          isDestructive: true
        }
      ]
    });
    setDialogVisible(true);
  }
  
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
  
  const renderItem = useCallback(
    ({ item }) => (
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
            onPress={() => handleDeleteHouse(item)}
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
    ),
    [handleViewHouse, handleEditHouse, colors.accentColor, colors.dangerColor, colors.infoColor]
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
          renderItem={renderItem}
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
      
      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        content={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
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
