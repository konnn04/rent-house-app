import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { formatCurrency } from '../../../../utils/Tools';

export const HousePriceInfo = ({ house }) => {
  const { colors } = useTheme();
  
  // Get utility fees
  const utilityFees = [
    { icon: 'flash', name: 'Điện', value: house.electricity_fee, unit: '/kWh' },
    { icon: 'water', name: 'Nước', value: house.water_fee, unit: '/m³' },
    { icon: 'wifi', name: 'Internet', value: house.internet_fee, unit: '/tháng' },
    { icon: 'broom', name: 'Dịch vụ', value: house.service_fee, unit: '/tháng' },
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Thông tin giá
      </Text>
      <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      
      {/* Monthly rent */}
      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Giá thuê:</Text>
        <Text style={[styles.priceValue, { color: colors.accentColor }]}>
          {formatCurrency(house.base_price)}<Text style={{ fontSize: 14 }}>/tháng</Text>
        </Text>
      </View>
      
      {/* Deposit */}
      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Đặt cọc:</Text>
        <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
          {formatCurrency(house.deposit)}
        </Text>
      </View>
      
      {/* Payment schedule */}
      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Thanh toán:</Text>
        <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
          {house.payment_term || 'Hàng tháng'}
        </Text>
      </View>
      
      {/* Utility fees heading */}
      <Text style={[styles.sectionSubtitle, { color: colors.textPrimary, marginTop: 15 }]}>
        Chi phí hàng tháng
      </Text>
      
      {/* Utility fees in a horizontal layout */}
      <View style={styles.utilitiesContainer}>
        {utilityFees.map((fee, index) => (
          <View key={index} style={styles.utilityItem}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentColorLight }]}>
              <Icon name={fee.icon} size={18} color={colors.accentColor} />
            </View>
            <Text style={[styles.utilityName, { color: colors.textPrimary }]}>{fee.name}</Text>
            <Text style={[styles.utilityValue, { color: colors.textSecondary }]}>
              {fee.value ? `${formatCurrency(fee.value)} ${fee.unit}` : 'Liên hệ'}
            </Text>
          </View>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  divider: {
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 15,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  utilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  utilityItem: {
    width: '48%',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  utilityName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  utilityValue: {
    fontSize: 13,
  },
});
