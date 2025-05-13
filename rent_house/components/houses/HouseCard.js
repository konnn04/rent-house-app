import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/Tools';

export const HouseCard = ({ house, onPress, style }) => {
  const { colors } = useTheme();
  
  // Map house types to icons and display names
  const houseTypeMap = {
    'apartment': { icon: 'home-city', label: 'Chung cư' },
    'house': { icon: 'home', label: 'Nhà riêng' },
    'villa': { icon: 'home-modern', label: 'Biệt thự' },
    'studio': { icon: 'office-building', label: 'Studio' },
    'dormitory': { icon: 'school', label: 'Ký túc xá' }
  };
  
  const houseType = houseTypeMap[house.type] || { icon: 'home-outline', label: 'Nhà' };
  
  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { backgroundColor: colors.backgroundSecondary },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: house.thumbnail }}
          style={styles.image}
          defaultSource={require('@assets/images/default-house.png')}
        />
        <View style={[styles.ownerBadge, { backgroundColor: colors.accentColor }]}>
          <Icon name="account" size={14} color="#FFF" />
          <Text style={styles.ownerName} numberOfLines={1}>
            {house.owner.last_name || house.owner.username}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.title, { color: colors.textPrimary }]} 
          numberOfLines={1}
        >
          {house.title}
        </Text>
        
        <View style={styles.addressRow}>
          <Icon name="map-marker" size={16} color={colors.accentColor} />
          <Text 
            style={[styles.address, { color: colors.textSecondary }]} 
            numberOfLines={1}
          >
            {house.address}
          </Text>
        </View>
        
        <View style={styles.detailsColumn}>
          <View style={styles.typeContainer}>
            <Icon name={houseType.icon} size={16} color={colors.accentColor} />
            <Text style={[styles.typeText, { color: colors.textSecondary }]}>
              {houseType.label}
            </Text>
          </View>
          
          <Text style={[styles.price, { color: colors.accentColor }]}>
            {formatCurrency(house.base_price)}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ownerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    maxWidth: 80,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  detailsColumn: {
    alignItems: 'flex-start',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});

