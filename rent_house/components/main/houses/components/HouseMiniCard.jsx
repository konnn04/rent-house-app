import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { formatCurrency } from '../../../../utils/Tools';

export const HouseMiniCard = ({ house, onPress }) => {
  const { colors } = useTheme();
  
  // Kiểm tra có ảnh thumbnail hay không
  const thumbnail = house.thumbnail || 'https://via.placeholder.com/150';
  
  // Kiểm tra còn phòng trống hay không
  const hasAvailableRooms = house.max_rooms && house.current_rooms < house.max_rooms;
  
  // Map house type to readable text
  const getHouseTypeText = (type) => {
    const types = {
      'house': 'Nhà riêng',
      'apartment': 'Căn hộ',
      'dormitory': 'Ký túc xá',
      'room': 'Phòng trọ',
      'villa': 'Biệt thự',
      'studio': 'Studio',
    };
    return types[type] || 'Nhà';
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: thumbnail }} style={styles.image} />
        
        {/* Verified badge */}
        {house.is_verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.successColor }]}>
            <Icon name="check-circle" size={10} color="#fff" />
            <Text style={styles.verifiedText}>Đã xác thực</Text>
          </View>
        )}
        
        {/* Price badge */}
        <View style={[styles.priceBadge, { backgroundColor: colors.accentColor }]}>
          <Text style={styles.priceText}>{formatCurrency(house.base_price)}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {house.title}
        </Text>
        
        <Text 
          style={[styles.address, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {house.address}
        </Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="home-variant" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {getHouseTypeText(house.type)}
            </Text>
          </View>
          
          {house.distance !== undefined && (
            <View style={styles.detailItem}>
              <Icon name="map-marker" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {house.distance.toFixed(1)} km
              </Text>
            </View>
          )}
          
          {house.type === 'room' && (
            <View style={styles.detailItem}>
              <Icon 
                name="door-open" 
                size={14} 
                color={hasAvailableRooms ? colors.successColor : colors.dangerColor} 
              />
              <Text 
                style={[
                  styles.detailText, 
                  { color: hasAvailableRooms ? colors.successColor : colors.dangerColor }
                ]}
              >
                {hasAvailableRooms 
                  ? `${house.max_rooms - house.current_rooms} phòng trống` 
                  : 'Hết phòng'}
              </Text>
            </View>
          )}
          
          {house.avg_rating > 0 && (
            <View style={styles.detailItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {house.avg_rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
