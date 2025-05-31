import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export const LocationPickerComponent = ({ 
  onLocationSelected, 
  onCancel, 
  initialAddress = '',
  initialLocation = null,
  colors 
}) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || {
    latitude: 10.7756587,  // Default to HCMC
    longitude: 106.7004238,
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const mapRef = useRef(null);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Cần quyền truy cập vị trí để sử dụng tính năng này');
        setLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setSelectedLocation({
        latitude,
        longitude,
      });
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=vi`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
      
      // Animate to the location
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Không thể lấy vị trí hiện tại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle location search
  const handleSearch = async (text) => {
    setAddress(text);
    
    if (text.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    try {
      // Sử dụng Nominatim thay cho Google Places
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&countrycodes=vn&accept-language=vi&limit=5`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Chuyển đổi định dạng kết quả để phù hợp với code hiện tại
        const predictions = data.map(item => ({
          place_id: item.place_id,
          description: item.display_name,
          // Lưu thêm thông tin tọa độ để không cần gọi API lần nữa
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        
        setSearchResults(predictions);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // Handle map press
  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({
      latitude,
      longitude,
    });
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=vi`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Handle search result selection
  const handleSelectSearchResult = async (item) => {
    try {
      // Đã có tọa độ từ kết quả tìm kiếm, không cần gọi API lần nữa
      const lat = item.lat;
      const lng = item.lng;
      
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
      });
      
      setAddress(item.description);
      
      // Animate to the location
      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setShowSearchResults(false);
    }
  };

  // Confirm location selection
  const handleConfirm = () => {
    onLocationSelected(address, selectedLocation.latitude, selectedLocation.longitude);
  };
  
  // Set region when initial location changes
  useEffect(() => {
    if (initialLocation?.latitude && initialLocation?.longitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [initialLocation]);

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
          <Text style={styles.headerTitle}>Chọn vị trí</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
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
              placeholder="Tìm kiếm địa chỉ"
              placeholderTextColor={colors.textSecondary}
              value={address}
              onChangeText={handleSearch}
            />
            {address ? (
              <TouchableOpacity onPress={() => setAddress('')}>
                <Icon name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={[styles.currentLocationButton, { backgroundColor: colors.accentColor }]}
            onPress={getCurrentLocation}
          >
            <Icon name="crosshairs-gps" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Search results */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={[styles.searchResultsContainer, { backgroundColor: colors.backgroundSecondary }]}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.searchResultItem}
                onPress={() => handleSelectSearchResult(item)}
              >
                <Icon name="map-marker" size={16} color={colors.accentColor} />
                <Text 
                  style={[styles.searchResultText, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Map view */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              draggable
              onDragEnd={handleMapPress}
            />
          </MapView>
          
          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accentColor} />
            </View>
          )}
        </View>
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
  confirmButton: {
    padding: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  searchInputContainer: {
    flex: 1,
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
  currentLocationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 76,
    left: 16,
    right: 64,
    zIndex: 10,
    borderRadius: 8,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchResultText: {
    marginLeft: 8,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
