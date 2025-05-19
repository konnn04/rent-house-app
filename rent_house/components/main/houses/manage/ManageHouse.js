import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge, Button, FAB, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { api } from '../../../../utils/Fetch';
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
  
  const fetchHouses = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);
      
      // Fetch houses
      const response = await api.get('/api/houses/my_houses/');
      setHouses(response.data.results || []);
      
      // Calculate statistics
      const totalHouses = response.data.count || 0;
      let totalRooms = 0;
      let availableRooms = 0;
      
      response.data.results.forEach(house => {
        totalRooms += house.room_count || 0;
        availableRooms += house.available_rooms || 0;
      });
      
      setStatistics({
        totalHouses,
        totalRooms,
        availableRooms,
        pendingVerifications: 0 // This will be updated from another API
      });
      
      // Check if user is verified (has ID verification)
      // In a real app, this would come from an API endpoint
      // For now, we'll use a placeholder value
    //   setIsVerified(userData?.is_verified || false);
      
    } catch (err) {
      console.error('Error fetching houses:', err);
      setError('Không thể tải danh sách nhà. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchHouses();
  }, []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchHouses();
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
    // if (!isVerified) {
    //   // Redirect to identity verification first
    //   navigation.navigate('IdentityVerification', { 
    //     redirectAfter: 'AddHouse'
    //   });
    //   return;
    // }
    
    navigation.navigate('AddHouse');
  };
  
  const handleEditHouse = (house) => {
    navigation.navigate('EditHouse', { houseId: house.id });
  };
  
  const handleViewHouse = (house) => {
    navigation.navigate('HouseDetail', { houseId: house.id });
  };
  
  const handleManageRooms = (house) => {
    navigation.navigate('RoomList', { 
      houseId: house.id,
      houseTitle: house.title || `Nhà ${house.id}`
    });
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
                
                <TouchableOpacity
                  style={[styles.roomsButton, { backgroundColor: colors.infoColor }]}
                  onPress={() => handleManageRooms(item)}
                >
                  <Icon name="door" size={20} color="#fff" />
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
    marginRight: 8,
  },
  roomsButton: {
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
