import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PaperDialog } from '../../../../components/ui/PaperDialog';
import { PaperIconButton } from '../../../../components/ui/PaperIconButton';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHousesByMapService } from '../../../../services/houseService';
import { HouseMarker } from './HouseMarker';
import { HousePreviewModal } from './HousePreviewModal';

export const MapViewCustom = ({ 
  mapHouses,
  setMapHouses,
  mapFilters,
  refreshing, 
  onRefresh,
  searchQuery
}) => {
  const { colors } = useTheme();
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [lastSearchCenter, setLastSearchCenter] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  // Thêm biến để theo dõi đã xin quyền vị trí chưa
  const [askedLocationPermission, setAskedLocationPermission] = useState(false);
  
  // State for house preview modal
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // State for dialog visibility
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogProps, setDialogProps] = useState({
    title: '',
    content: '',
    actions: []
  });

  // Default region (Ho Chi Minh City center)
  const defaultRegion = {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Xử lý search timeout
  const searchTimeoutRef = useRef(null);

  // Get user's current location
  const getUserLocation = async (forceRequest = false) => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      // Kiểm tra xem đã xin quyền chưa, nếu đã xin rồi thì kiểm tra trạng thái quyền
      let status;
      if (!askedLocationPermission || forceRequest) {
        const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
        status = permissionStatus;
        setAskedLocationPermission(true);
      } else {
        const { status: permissionStatus } = await Location.getForegroundPermissionsAsync();
        status = permissionStatus;
      }

      if (status !== 'granted') {
        setLocationError('Cần quyền truy cập vị trí để hiển thị vị trí của bạn');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setUserLocation(userLoc);
      setMapRegion(userLoc);
      
      // Move map to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion(userLoc, 1000);
      }
      
      // Tìm kiếm nhà xung quanh vị trí hiện tại
      searchHousesNearLocation(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Không thể lấy vị trí hiện tại');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Tìm kiếm nhà xung quanh vị trí
  const searchHousesNearLocation = useCallback(async (latitude, longitude) => {
    // Nếu đã tìm kiếm gần đây ở vị trí này, bỏ qua
    if (lastSearchCenter && 
        Math.abs(lastSearchCenter.latitude - latitude) < 0.01 && 
        Math.abs(lastSearchCenter.longitude - longitude) < 0.01 &&
        !mapFilters.query) {
      return;
    }
    
    try {
      setLoadingHouses(true);
      
      // Lưu vị trí tìm kiếm hiện tại
      setLastSearchCenter({ latitude, longitude });
      
      // Lấy các tham số filter
      const { type, min_price, max_price, is_verified, is_renting, is_blank, query } = mapFilters || {};
      
      const houses = await getHousesByMapService({
        query: query || searchQuery || '', // Sử dụng query từ mapFilters hoặc từ searchQuery
        lat: latitude,
        lon: longitude,
        type,
        min_price,
        max_price,
        is_verified,
        is_renting,
        is_blank,
        limit: 20
      });
      
      setMapHouses(houses.results || []);
    } catch (error) {
      console.error('Error searching houses:', error);
      // Không hiển thị lỗi cho người dùng để tránh làm phiền
    } finally {
      setLoadingHouses(false);
    }
  }, [lastSearchCenter, mapFilters, setMapHouses, searchQuery]);

  // Xử lý khi region thay đổi
  const handleRegionChangeComplete = (region) => {
    setMapRegion(region);
    
    // Hủy timeout trước đó nếu có
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Đặt timeout mới để tránh quá nhiều API calls
    searchTimeoutRef.current = setTimeout(() => {
      searchHousesNearLocation(region.latitude, region.longitude);
    }, 1000); // 1 giây sau khi người dùng dừng di chuyển bản đồ
  };

  // Initialize user location
  useEffect(() => {
    getUserLocation();
    
    // Cleanup timeout khi unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Khi filter hoặc searchQuery thay đổi, tìm kiếm lại
  useEffect(() => {
    if (mapRegion) {
      // Reset lastSearchCenter để buộc tìm kiếm lại
      setLastSearchCenter(null);
      searchHousesNearLocation(mapRegion.latitude, mapRegion.longitude);
    }
  }, [mapFilters, searchQuery]);

  // Handle "locate me" button press
  const handleLocateMe = () => {
    if (locationError) {
      setDialogProps({
        title: 'Lỗi vị trí',
        content: 'Bạn cần cấp quyền truy cập vị trí để sử dụng tính năng này. Bạn có muốn cấp quyền không?',
        actions: [
          { label: 'Hủy', onPress: () => setDialogVisible(false) },
          { 
            label: 'Đồng ý', 
            onPress: () => {
              setDialogVisible(false);
              getUserLocation(true);
            },
            mode: 'contained',
            color: colors.accentColor
          }
        ]
      });
      setDialogVisible(true);
      return;
    }

    getUserLocation();
  };

  // Updated function to handle marker press
  const handleMarkerPress = (houseId) => {
    // Find the house object from the mapHouses array
    const house = mapHouses.find(h => h.id === houseId);
    if (house) {
      setSelectedHouse(house);
      setPreviewModalVisible(true);
    }
  };

  // Handle navigation to house detail from modal
  const handleViewHouseDetail = () => {
    if (selectedHouse) {
      navigation.navigate('HouseDetail', { houseId: selectedHouse.id });
      setPreviewModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={userLocation || defaultRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor={colors.accentColor}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {mapHouses.map((house) => (
          <HouseMarker
            key={house.id}
            house={house}
            onMarkerPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Loading indicator */}
      {loadingHouses && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.accentColor} />
          <Text style={{ color: colors.textPrimary, marginLeft: 8 }}>Đang tìm...</Text>
        </View>
      )}

      {/* Search query indicator */}
      {(searchQuery || mapFilters.query) && (
        <View style={[styles.searchQueryBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <Icon name="magnify" size={16} color={colors.accentColor} />
          <Text style={{ color: colors.textPrimary, marginLeft: 4 }}>
            {mapFilters.query || searchQuery}
          </Text>
        </View>
      )}

      {/* Locate me button - replaced with PaperIconButton */}
      <View style={[styles.locateButton, { backgroundColor: colors.backgroundSecondary }]}>
        <PaperIconButton
          icon="crosshairs-gps"
          size={24}
          color={colors.accentColor}
          onPress={handleLocateMe}
          disabled={loadingLocation}
          style={styles.iconButton}
        />
        {loadingLocation && (
          <ActivityIndicator 
            size="small" 
            color={colors.accentColor} 
            style={styles.loadingIndicator} 
          />
        )}
      </View>

      {/* Houses count */}
      <View style={[styles.countBadge, { backgroundColor: colors.accentColor }]}>
        <Text style={styles.countText}>{mapHouses.length} nhà</Text>
      </View>

      {/* House Preview Modal */}
      <HousePreviewModal
        visible={previewModalVisible}
        house={selectedHouse}
        onClose={() => setPreviewModalVisible(false)}
        onViewDetail={handleViewHouseDetail}
        colors={colors}
      />

      {/* Location Permission Dialog - using PaperDialog */}
      <PaperDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        title={dialogProps.title}
        content={dialogProps.content}
        actions={dialogProps.actions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  locateButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconButton: {
    margin: 0,
  },
  loadingIndicator: {
    position: 'absolute',
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchQueryBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
});
