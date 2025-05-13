import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { HouseMarker } from './HouseMarker';

export const MapViewCustom = ({ houses, refreshing, onRefresh }) => {
  const { colors } = useTheme();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Default region (Ho Chi Minh City center)
  const defaultRegion = {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Get user's current location
  const getUserLocation = async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
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
      
      // Move map to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion(userLoc, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Không thể lấy vị trí hiện tại');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Initialize user location
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fit map to show all markers when houses change
  useEffect(() => {
    if (houses.length > 0 && mapRef.current) {
      // Wait a bit for map to fully initialize
      setTimeout(() => {
        try {
          const coordinates = houses.map(house => ({
            latitude: house.latitude,
            longitude: house.longitude,
          }));

          if (coordinates.length === 1) {
            // If only one house, center on it with some zoom
            mapRef.current.animateToRegion({
              latitude: coordinates[0].latitude,
              longitude: coordinates[0].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          } else if (coordinates.length > 1) {
            // If multiple houses, fit to show all
            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        } catch (error) {
          console.error('Error fitting map to coordinates:', error);
        }
      }, 500);
    }
  }, [houses]);

  // Handle "locate me" button press
  const handleLocateMe = () => {
    if (locationError) {
      Alert.alert(
        'Lỗi vị trí',
        locationError,
        [{ text: 'OK' }]
      );
      return;
    }

    getUserLocation();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor={colors.accentColor}
      >
        {houses.map(house => (
          <HouseMarker key={house.id} house={house} />
        ))}
      </MapView>

      {/* Locate me button */}
      <TouchableOpacity
        style={[styles.locateButton, { backgroundColor: colors.backgroundSecondary }]}
        onPress={handleLocateMe}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator size="small" color={colors.accentColor} />
        ) : (
          <Icon name="crosshairs-gps" size={24} color={colors.accentColor} />
        )}
      </TouchableOpacity>

      {/* Houses count */}
      <View style={[styles.countBadge, { backgroundColor: colors.accentColor }]}>
        <Text style={styles.countText}>{houses.length} nhà</Text>
      </View>
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
});
