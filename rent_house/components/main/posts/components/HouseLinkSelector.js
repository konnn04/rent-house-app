import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../../../utils/Fetch';

export const HouseLinkSelector = ({ onSelectHouse, onCancel, colors }) => {
  const [loading, setLoading] = useState(true);
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Fetch user's houses
  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/houses/my_houses/');
      if (response.data.results) {
        setHouses(response.data.results);
        setFilteredHouses(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
      setError('Không thể tải danh sách nhà/phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredHouses(houses);
      return;
    }
    
    const filtered = houses.filter(
      house => house.title.toLowerCase().includes(text.toLowerCase()) || 
               house.address.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredHouses(filtered);
  };

  // Render house item
  const renderHouseItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.houseItem, { backgroundColor: colors.backgroundSecondary }]}
      onPress={() => onSelectHouse(item)}
    >
      <Image
        source={{ uri: item.thumbnail || 'https://via.placeholder.com/60' }}
        style={styles.houseThumbnail}
      />
      <View style={styles.houseInfo}>
        <Text style={[styles.houseTitle, { color: colors.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.houseAddress, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.address}
        </Text>
        <Text style={[styles.housePrice, { color: colors.accentColor }]}>
          {item.base_price?.toLocaleString('vi-VN')} đ/tháng
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={true}
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.accentColor }]}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn nhà/phòng</Text>
          <View style={{ width: 32 }} />
        </View>
        
        {/* Search input */}
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchInputContainer,
            { backgroundColor: colors.backgroundSecondary }
          ]}>
            <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Tìm kiếm nhà/phòng"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Icon name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        
        {/* House list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accentColor} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Đang tải danh sách nhà/phòng...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
            <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
              onPress={fetchHouses}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredHouses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="home-search" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery.trim() 
                ? 'Không tìm thấy nhà/phòng nào phù hợp' 
                : 'Bạn chưa có nhà/phòng nào'}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity
                style={[styles.createHouseButton, { backgroundColor: colors.accentColor }]}
                onPress={() => {
                  onCancel();
                  // Navigate to create house screen - add this functionality if needed
                }}
              >
                <Text style={styles.createHouseButtonText}>Tạo nhà/phòng mới</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredHouses}
            keyExtractor={item => item.id.toString()}
            renderItem={renderHouseItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
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
    height: 60,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
  },
  listContainer: {
    padding: 16,
  },
  houseItem: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  houseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  houseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  houseTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  houseAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  housePrice: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  createHouseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createHouseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
