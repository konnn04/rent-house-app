import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Chip, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { formatCurrency } from '../../../../utils/Tools';

export const HouseBasicInfo = ({ house }) => {
  const { colors } = useTheme();
  
  // Handle open maps
  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${house.latitude},${house.longitude}`;
    Linking.openURL(url);
  };
  
  // Map house type to readable text
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
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Title and verified badge */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {house.title}
        </Text>
        {house.is_verified && (
          <Chip
            icon="check-circle"
            mode="outlined"
            style={[styles.verifiedChip, { borderColor: colors.successColor }]}
            textStyle={{ color: colors.successColor }}
          >
            Đã xác thực
          </Chip>
        )}
      </View>
      
      {/* Type and price */}
      <View style={styles.typeAndPriceContainer}>
        <Chip
          icon="home"
          mode="outlined"
          style={styles.typeChip}
        >
          {getHouseTypeText(house.type)}
        </Chip>
        
        <Text style={[styles.price, { color: colors.accentColor }]}>
          {formatCurrency(house.base_price)}/tháng
        </Text>
      </View>
      
      <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      
      {/* Address */}
      <TouchableOpacity
        style={styles.addressContainer}
        onPress={handleOpenMaps}
      >
        <Icon name="map-marker" size={20} color={colors.accentColor} />
        <Text style={[styles.address, { color: colors.textPrimary }]}>
          {house.address}
        </Text>
        <Icon name="directions" size={18} color={colors.accentColor} style={styles.directionsIcon} />
      </TouchableOpacity>
      
      {/* Quick stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="door" size={18} color={colors.accentColor} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {house.room_count || 0} phòng
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="door-open" size={18} color={colors.accentColor} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {house.available_rooms || 0} phòng trống
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="star" size={18} color="#FFD700" />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {house.avg_rating ? house.avg_rating.toFixed(1) : 'Chưa có'} sao
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  verifiedChip: {
    height: 28,
  },
  typeAndPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeChip: {
    height: 32,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  directionsIcon: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
  },
});
