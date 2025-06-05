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
  
  const utilityFees = [
    { icon: 'flash', name: 'Điện', value: house.electricity_price, unit: '/kWh' },
    { icon: 'water', name: 'Nước', value: house.water_price, unit: '/m³' },
    { icon: 'wifi', name: 'Internet', value: house.electricity_price, unit: '/tháng' },
    { icon: 'delete-outline', name: 'Rác', value: house.trash_price, unit: '/tháng' },
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
      
      {/* Utility fees in a table layout */}
      <View style={styles.utilityTable}>
        {utilityFees.map((fee, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCell}>
              <View style={styles.nameContainer}>
                <Icon name={fee.icon} size={18} color={colors.accentColor} style={styles.icon} />
                <Text style={[styles.utilityName, { color: colors.textPrimary }]}>{fee.name}</Text>
              </View>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.utilityValue, { color: colors.textSecondary }]}>
                {fee.value ? `${formatCurrency(fee.value)} ${fee.unit}` : 'Liên hệ'}
              </Text>
            </View>
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
  utilityTable: {
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tableCell: {
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  utilityName: {
    fontSize: 14,
    fontWeight: '500',
  },
  utilityValue: {
    fontSize: 14,
    textAlign: 'right',
  },
});
