import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { getHousesService } from '../../../services/houseService';
import { ListView } from './components/ListView';
import { MapViewCustom } from './components/MapViewCustom';
import { SearchFilters } from './components/SearchFilters';

export const LookupScreen = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('list'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    type: '',
    min_price: '',
    max_price: '',
    area: '',
    has_rooms: false,
    ordering: '-created_at'
  });

  // Fetch houses with search and filters, hỗ trợ lazy loading
  const fetchHouses = useCallback(async (isRefresh = false, newQuery = null, newFilters = null, customNextUrl = null) => {
    try {
      const actualQuery = newQuery !== null ? newQuery : searchQuery;
      const actualFilters = newFilters !== null ? newFilters : filters;
      let actualPage = isRefresh ? 1 : page;
      let useNextUrl = customNextUrl || (isRefresh ? null : nextUrl);

      if (isRefresh) {
        setRefreshing(true);
      } else if (!isRefresh && useNextUrl) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      let data;
      if (useNextUrl) {
        // Lazy load: chỉ cần nextUrl
        data = await getHousesService({ nextUrl: useNextUrl });
      } else {
        // Trang đầu: truyền filter
        data = await getHousesService({
          search: actualQuery,
          type: actualFilters.type,
          min_price: actualFilters.min_price,
          max_price: actualFilters.max_price,
          area: actualFilters.area,
          has_rooms: actualFilters.has_rooms,
          ordering: actualFilters.ordering,
          page: actualPage,
          page_size: 10,
        });
      }

      setNextUrl(data.next || null);

      const newHouses = Array.isArray(data.results) ? data.results : [];

      if (isRefresh) {
        setHouses(newHouses);
        setFilteredHouses(newHouses);
        setPage(2); // next page sẽ là 2
      } else {
        setHouses(prev => [...prev, ...newHouses]);
        setFilteredHouses(prev => [...prev, ...newHouses]);
        setPage(prev => prev + 1);
      }

      setHasMore(!!data.next);
    } catch (err) {
      console.error('Error fetching houses:', err);
      setError('Không thể tải danh sách nhà. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [searchQuery, filters, page, nextUrl]);

  // Initial fetch
  useEffect(() => {
    fetchHouses(true);
  }, []);

  // Handle search submit
  const handleSearch = () => {
    setPage(1);
    setNextUrl(null);
    fetchHouses(true, searchQuery);
  };

  // Handle filter application
  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
    setPage(1);
    setNextUrl(null);
    fetchHouses(true, null, newFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    setPage(1);
    setNextUrl(null);
    fetchHouses(true);
  };

  // Handle pagination (load more)
  const handleLoadMore = () => {
    if (hasMore && !loadingMore && nextUrl) {
      fetchHouses(false, null, null, nextUrl);
    }
  };

  // Render header with search and filter
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Tìm nhà</Text>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm địa chỉ, khu vực..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          inputStyle={{ color: colors.textPrimary }}
          placeholderTextColor={colors.textSecondary}
          iconColor={colors.textSecondary}
        />
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.accentColor }]}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter-variant" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'list' && { backgroundColor: colors.accentColor }
          ]}
          onPress={() => setActiveTab('list')}
        >
          <Icon
            name="format-list-bulleted"
            size={24}
            color={activeTab === 'list' ? '#fff' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'list' ? '#fff' : colors.textSecondary }
            ]}
          >
            Danh sách
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'map' && { backgroundColor: colors.accentColor }
          ]}
          onPress={() => setActiveTab('map')}
        >
          <Icon
            name="map"
            size={24}
            color={activeTab === 'map' ? '#fff' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'map' ? '#fff' : colors.textSecondary }
            ]}
          >
            Bản đồ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main render
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {renderHeader()}
      
      {loading && !refreshing && !loadingMore ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
            onPress={() => fetchHouses(true)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {activeTab === 'list' ? (
            <ListView
              houses={filteredHouses}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          ) : (
            <MapViewCustom
              houses={filteredHouses}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </>
      )}
      
      <SearchFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    borderRadius: 10,
    marginRight: 8,
  },
  filterButton: {
    width: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '500',
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
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});