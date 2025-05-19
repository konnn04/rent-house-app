import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatCurrency } from '../../../utils/Tools';

export const RoomCard = ({ room, onPress }) => {
  const { colors } = useTheme();
  
  // Calculate occupancy percentage for visual indicator
  const occupancyPercentage = room.max_people > 0 
    ? (room.cur_people / room.max_people) * 100 
    : 0;
    
  // Determine status color based on occupancy
  const getOccupancyColor = () => {
    if (occupancyPercentage >= 100) return colors.dangerColor; // Full
    if (occupancyPercentage >= 75) return '#FF9800'; // Almost full
    return colors.successColor; // Available
  };
  
  // Get status text
  const getStatusText = () => {
    if (occupancyPercentage >= 100) return 'Đã đầy';
    if (occupancyPercentage > 0) return `${room.cur_people}/${room.max_people} người`;
    return 'Còn trống';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Room image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: room.thumbnail || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          defaultSource={require('@assets/logo.png')}
        />
        <View style={[styles.priceBadge, { backgroundColor: colors.accentColor }]}>
          <Text style={styles.priceText}>
            {formatCurrency(room.price)}
          </Text>
        </View>
      </View>

      {/* Room details */}
      <View style={styles.detailsContainer}>
        <Text 
          style={[styles.title, { color: colors.textPrimary }]} 
          numberOfLines={1}
        >
          {room.title || `Phòng ${room.id}`}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon name="ruler" size={16} color={colors.accentColor} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {room.area || '--'} m²
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Icon name="bed" size={16} color={colors.accentColor} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {room.bedrooms || 1}
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Icon name="shower" size={16} color={colors.accentColor} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {room.bathrooms || 1}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.occupancyContainer}>
            <View style={[styles.occupancyBar, { backgroundColor: colors.borderColor }]}>
              <View 
                style={[
                  styles.occupancyFill, 
                  { 
                    backgroundColor: getOccupancyColor(),
                    width: `${Math.min(occupancyPercentage, 100)}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.occupancyText, { color: colors.textSecondary }]}>
              {getStatusText()}
            </Text>
          </View>
          
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip, 
              { borderColor: getOccupancyColor() }
            ]}
            textStyle={{ 
              fontSize: 12, 
              color: getOccupancyColor() 
            }}
          >
            {room.is_available ? 'Còn trống' : 'Đã đầy'}
          </Chip>
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
    height: 150,
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
  detailsContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occupancyContainer: {
    flex: 1,
    marginRight: 10,
  },
  occupancyBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  occupancyText: {
    fontSize: 12,
  },
  statusChip: {
    height: 24,
  }
});
