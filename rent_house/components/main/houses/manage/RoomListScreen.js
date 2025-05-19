import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge, Button, FAB, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { api } from '../../../../utils/Fetch';
import { formatCurrency } from '../../../../utils/Tools';
import { ManageHeader } from './components/ManageHeader';
import { RoomCard } from './components/RoomCard';

export const RoomListScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { houseId, houseTitle } = route.params;
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [houseDetails, setHouseDetails] = useState(null);
  
  const fetchRooms = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);
      
      // Fetch rooms for the specific house
      const response = await api.get(`/api/houses/${houseId}/rooms/`);
      setRooms(response.data || []);
      
      // Fetch house details
      const houseResponse = await api.get(`/api/houses/${houseId}/`);
      setHouseDetails(houseResponse.data);
      
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchRooms();
  }, [houseId]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchRooms();
      return;
    }
    
    const filtered = rooms.filter(room => 
      room.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setRooms(filtered);
  };
  
  const handleAddRoom = () => {
    navigation.navigate('AddEditRoom', { 
      houseId,
      houseTitle
    });
  };
  
  const handleEditRoom = (room) => {
    navigation.navigate('AddEditRoom', { 
      houseId,
      houseTitle,
      roomId: room.id,
      isEditing: true
    });
  };
  
  const handleViewRoom = (room) => {
    navigation.navigate('RoomDetail', { roomId: room.id });
  };
  
  const handleDeleteRoom = (room) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa phòng "${room.title}" không?`,
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/rooms/${room.id}/`);
              Alert.alert('Thành công', 'Phòng đã được xóa');
              fetchRooms();
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Lỗi', 'Không thể xóa phòng. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="door" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Chưa có phòng nào trong căn hộ/nhà này
      </Text>
      <Button 
        mode="contained" 
        onPress={handleAddRoom}
        style={[styles.addButton, { backgroundColor: colors.accentColor }]}
      >
        + Thêm phòng mới
      </Button>
    </View>
  );
  
  const renderHouseInfoHeader = () => (
    houseDetails && (
      <View style={[styles.infoContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
          {houseDetails.title}
        </Text>
        <Text style={[styles.infoAddress, { color: colors.textSecondary }]}>
          {houseDetails.address}
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {houseDetails.room_count || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Tổng số phòng
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.successColor }]}>
              {houseDetails.available_rooms || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Phòng còn trống
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accentColor }]}>
              {formatCurrency(houseDetails.base_price || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Giá cơ bản
            </Text>
          </View>
        </View>
      </View>
    )
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ManageHeader 
        title={`Quản lý phòng - ${houseTitle}`} 
        showBack={true}
        onBackPress={() => navigation.goBack()}
        right={
          <Button 
            icon="home-edit" 
            mode="text" 
            onPress={() => navigation.navigate('EditHouse', { houseId })}
          >
            Sửa nhà
          </Button>
        }
      />
      
      {!loading && !refreshing && renderHouseInfoHeader()}
      
      <Searchbar
        placeholder="Tìm kiếm phòng..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
            Đang tải danh sách phòng...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchRooms}
            style={{ backgroundColor: colors.accentColor, marginTop: 10 }}
          >
            Thử lại
          </Button>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.roomCardContainer}>
              <RoomCard 
                room={item} 
                onPress={() => handleViewRoom(item)}
              />
              
              <View style={styles.roomActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.accentColor }]}
                  onPress={() => handleEditRoom(item)}
                >
                  <Icon name="pencil" size={18} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.dangerColor }]}
                  onPress={() => handleDeleteRoom(item)}
                >
                  <Icon name="delete" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {item.cur_people >= item.max_people && (
                <Badge
                  style={[styles.fullBadge, { backgroundColor: colors.dangerColor }]}
                >
                  Đã đầy
                </Badge>
              )}
              
              {item.cur_people > 0 && item.cur_people < item.max_people && (
                <Badge
                  style={[styles.partialBadge, { backgroundColor: colors.warningColor }]}
                >
                  Còn {item.max_people - item.cur_people} chỗ
                </Badge>
              )}
              
              {item.cur_people === 0 && (
                <Badge
                  style={[styles.emptyBadge, { backgroundColor: colors.successColor }]}
                >
                  Còn trống
                </Badge>
              )}
            </View>
          )}
          contentContainerStyle={rooms.length === 0 && styles.emptyList}
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
        onPress={handleAddRoom}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoAddress: {
    fontSize: 14,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
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
  roomCardContainer: {
    position: 'relative',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  roomActions: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fullBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
  },
  partialBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
  },
  emptyBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 50,
  },
});
