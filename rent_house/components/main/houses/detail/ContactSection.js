import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { formatCurrency } from '../../../../utils/Tools';

export const ContactSection = ({ house, onContactPress, isLoading = false }) => {
  const { colors } = useTheme();
  
  if (!house) return null;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.priceContainer}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
          Giá
        </Text>
        <Text style={[styles.price, { color: colors.accentColor }]}>
          {formatCurrency(house.base_price)}
          <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>
            /tháng
          </Text>
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.contactButton, { backgroundColor: colors.accentColor }]}
        onPress={onContactPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Icon name="message-text" size={20} color="white" />
            <Text style={styles.contactButtonText}>
              Liên hệ ngay
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
