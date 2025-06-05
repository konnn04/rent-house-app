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
import MapView, { UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHousesByMapService } from '../../../../services/houseService';
import { PaperDialog } from '../../../common/PaperDialog';
import { PaperIconButton } from '../../../common/PaperIconButton';
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
  const [askedLocationPermission, setAskedLocationPermission] = useState(false);
  
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogProps, setDialogProps] = useState({
    title: '',
    content: '',
    actions: []
  });

  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null); 
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false); // Thêm biến cờ

  const defaultRegion = {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const searchTimeoutRef = useRef(null);

  const requestLocationPermissionOnce = async () => {
    if (hasRequestedLocation) {
      return locationPermissionStatus === 'granted';
    }
    setHasRequestedLocation(true);
    try {
      setLoadingLocation(true);
      setLocationError(null);

      if (locationPermissionStatus === 'granted') {
        return true;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);

      if (status !== 'granted') {
        setLocationError('Bạn cần cấp quyền truy cập vị trí để sử dụng tính năng này.');
        setDialogProps({
          title: 'Lỗi vị trí',
          content: 'Bạn cần cấp quyền truy cập vị trí để sử dụng tính năng này. Vui lòng vào cài đặt để cấp quyền.',
          actions: [
            { label: 'Đóng', onPress: () => setDialogVisible(false) }
          ]
        });
        setDialogVisible(true);
        return false;
      }
      return true;
    } catch (error) {
      setLocationError('Không thể xin quyền vị trí');
      setDialogProps({
        title: 'Lỗi vị trí',
        content: 'Không thể xin quyền vị trí. Vui lòng thử lại hoặc kiểm tra cài đặt.',
        actions: [
          { label: 'Đóng', onPress: () => setDialogVisible(false) }
        ]
      });
      setDialogVisible(true);
      return false;
    } finally {
      setLoadingLocation(false);
    }
  };

  const getUserLocation = async (forceRequest = false) => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      if (locationPermissionStatus !== 'granted' || forceRequest) {
        const ok = await requestLocationPermissionOnce();
        if (!ok) return;
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
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(userLoc, 1000);
      }
      
      searchHousesNearLocation(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      setLocationError('Không thể lấy vị trí hiện tại');
      setDialogProps({
        title: 'Lỗi vị trí',
        content: 'Không thể lấy vị trí hiện tại. Vui lòng thử lại hoặc kiểm tra cài đặt.',
        actions: [
          { label: 'Đóng', onPress: () => setDialogVisible(false) }
        ]
      });
      setDialogVisible(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  const searchHousesNearLocation = useCallback(async (latitude, longitude) => {
    if (lastSearchCenter && 
        Math.abs(lastSearchCenter.latitude - latitude) < 0.01 && 
        Math.abs(lastSearchCenter.longitude - longitude) < 0.01 &&
        !mapFilters.query) {
      return;
    }
    
    try {
      setLoadingHouses(true);
      
      setLastSearchCenter({ latitude, longitude });
      
      const { type, min_price, max_price, is_verified, is_renting, is_blank, query } = mapFilters || {};
      
      const houses = await getHousesByMapService({
        query: query || searchQuery || '', 
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
    } finally {
      setLoadingHouses(false);
    }
  }, [lastSearchCenter, mapFilters, setMapHouses, searchQuery]);

  const handleRegionChangeComplete = (region) => {
    setMapRegion(region);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchHousesNearLocation(region.latitude, region.longitude);
    }, 1000); 
  };

  useEffect(() => {
    // Chỉ xin quyền nếu chưa có, và chỉ lấy vị trí nếu đã có quyền
    if (locationPermissionStatus === 'granted') {
      getUserLocation();
    } else if (locationPermissionStatus === null) {
      requestLocationPermissionOnce();
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [locationPermissionStatus]);

  useEffect(() => {
    if (mapRegion) {
      setLastSearchCenter(null);
      searchHousesNearLocation(mapRegion.latitude, mapRegion.longitude);
    }
  }, [mapFilters, searchQuery]);

  const handleLocateMe = () => {
    if (locationPermissionStatus === 'granted') {
      getUserLocation();
      return;
    }
    requestLocationPermissionOnce().then((ok) => {
      if (ok) getUserLocation();
    });
  };

  const handleMarkerPress = (houseId) => {
    const house = mapHouses.find(h => h.id === houseId);
    if (house) {
      setSelectedHouse(house);
      setPreviewModalVisible(true);
    }
  };

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
        initialRegion={userLocation || defaultRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor={colors.accentColor}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
          zIndex={-1}
        />
        {mapHouses.map((house) => (
          <HouseMarker
            key={house.id}
            house={house}
            onMarkerPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {loadingHouses && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.accentColor} />
          <Text style={{ color: colors.textPrimary, marginLeft: 8 }}>Đang tìm...</Text>
        </View>
      )}

      {(searchQuery || mapFilters.query) && (
        <View style={[styles.searchQueryBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <Icon name="magnify" size={16} color={colors.accentColor} />
          <Text style={{ color: colors.textPrimary, marginLeft: 4 }}>
            {mapFilters.query || searchQuery}
          </Text>
        </View>
      )}

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

      <View style={[styles.countBadge, { backgroundColor: colors.accentColor }]}>
        <Text style={styles.countText}>{mapHouses.length} nhà</Text>
      </View>

      <HousePreviewModal
        visible={previewModalVisible}
        house={selectedHouse}
        onClose={() => setPreviewModalVisible(false)}
        onViewDetail={handleViewHouseDetail}
        colors={colors}
      />

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
    height: Dimensions.get('window').height - 100, 
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
