import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { formatCurrency } from '../../../../utils/Tools';

export const HouseCard = ({ house, onPress }) => {
  const { colors } = useTheme();
  
  // Map house types to readable text
  const getHouseTypeText = (type) => {
    const types = {
      'house': 'Nhà riêng',
      'apartment': 'Căn hộ',
      'villa': 'Biệt thự',
      'dormitory': 'Ký túc xá',
      'studio': 'Studio',
    };
    return types[type] || 'Nhà';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* House image with price badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: house.thumbnail || 'https://via.placeholder.com/400x300' }}
          style={styles.image}
          defaultSource={require('@assets/images/default-house.png')}
        />
        <View style={[styles.priceBadge, { backgroundColor: colors.accentColor }]}>
          <Text style={styles.priceText}>
            {formatCurrency(house.base_price)}
          </Text>
        </View>
        {house.is_verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.successColor }]}>
            <Icon name="check-circle" size={14} color="white" />
            <Text style={styles.verifiedText}>Đã xác thực</Text>
          </View>
        )}
      </View>

      {/* House details */}
      <View style={styles.detailsContainer}>
        <Text 
          style={[styles.title, { color: colors.textPrimary }]} 
          numberOfLines={1}
        >
          {house.title}
        </Text>
        
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={16} color={colors.textSecondary} />
          <Text 
            style={[styles.location, { color: colors.textSecondary }]} 
            numberOfLines={1}
          >
            {house.address}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon name="door" size={16} color={colors.accentColor} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {house.room_count || 0}
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Icon name="door-open" size={16} color={colors.successColor} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {house.available_rooms || 0}
            </Text>
          </View>
          
          <Chip 
            mode="outlined"
            style={styles.typeChip}
            textStyle={{ fontSize: 12 }}
          >
            {getHouseTypeText(house.type)}
          </Chip>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={[styles.rating, { color: colors.textSecondary }]}>
              {house.avg_rating ? house.avg_rating.toFixed(1) : '--'}
            </Text>
          </View>
          
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            {house.updated_at ? new Date(house.updated_at).toLocaleDateString() : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 13,
    marginLeft: 4,
  },
  typeChip: {
    paddingVertical: 1,
    marginLeft: 'auto',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    marginLeft: 4,
  },
  lastUpdated: {
    fontSize: 12,
  },
});

