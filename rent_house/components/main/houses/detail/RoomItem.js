import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { formatCurrency } from '../../../../utils/Tools';

export const RoomItem = ({ room, onPress }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary }
      ]}
      onPress={onPress}
    >
      {/* Room image and availability badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: room.thumbnail }}
          style={styles.image}
          defaultSource={require('@assets/logo.png')}
        />
        <Badge
          style={[
            styles.badge,
            { backgroundColor: room.is_available ? colors.successColor : colors.textSecondary }
          ]}
        >
          {room.is_available ? 'Còn trống' : 'Đã thuê'}
        </Badge>
      </View>
      
      {/* Room details */}
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {room.title}
        </Text>
        
        <Text style={[styles.price, { color: colors.accentColor }]}>
          {formatCurrency(room.price)}/tháng
        </Text>
        
        <View style={styles.featuresContainer}>
          {/* Area */}
          <View style={styles.featureItem}>
            <Icon name="vector-square" size={16} color={colors.textSecondary} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              {room.area} m²
            </Text>
          </View>
          
          {/* Bedrooms */}
          <View style={styles.featureItem}>
            <Icon name="bed" size={16} color={colors.textSecondary} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              {room.bedrooms} phòng ngủ
            </Text>
          </View>
          
          {/* Bathrooms */}
          <View style={styles.featureItem}>
            <Icon name="shower" size={16} color={colors.textSecondary} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              {room.bathrooms} phòng tắm
            </Text>
          </View>
          
          {/* Occupancy */}
          <View style={styles.featureItem}>
            <Icon name="account-group" size={16} color={colors.textSecondary} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              {room.cur_people}/{room.max_people} người
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: 120,
  },
  image: {
    width: 120,
    height: 120,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  detailsContainer: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
