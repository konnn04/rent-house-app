import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '../../../../utils/Tools';

export const HousePreviewModal = ({ visible, house, onClose, onViewDetail, colors }) => {
  if (!house) return null;

  const getHouseTypeText = (type) => {
    const types = {
      'house': 'Nhà riêng',
      'apartment': 'Căn hộ',
      'dormitory': 'Ký túc xá',
      'room': 'Phòng trọ',
    };
    return types[type] || 'Nhà';
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <Image
            source={{ uri: house.thumbnail || 'https://via.placeholder.com/400x200' }}
            style={styles.image}
            defaultSource={require('@assets/images/default-house.png')}
          />
          
          <View style={styles.infoContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
              {house.title}
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.accentColor }]}>
                {formatCurrency(house.base_price)}/tháng
              </Text>
              {house.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="check-circle" size={16} color={colors.successColor} />
                  <Text style={[styles.verifiedText, { color: colors.successColor }]}>
                    Đã xác thực
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="home-variant" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {getHouseTypeText(house.type)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="map-marker" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={2}>
                {house.address}
              </Text>
            </View>
            
            {house.avg_rating && (
              <View style={styles.detailRow}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {house.avg_rating.toFixed(1)} sao
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.viewDetailButton, { backgroundColor: colors.accentColor }]}
            onPress={onViewDetail}
          >
            <Text style={styles.viewDetailText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  viewDetailButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
