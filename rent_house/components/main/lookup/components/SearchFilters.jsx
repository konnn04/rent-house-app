import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Chip, Divider, Switch, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';

export const SearchFilters = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  mode = 'list' 
}) => {
  const { colors } = useTheme();
  const [filters, setFilters] = useState({
    type: initialFilters.type || '',
    min_price: initialFilters.min_price || '',
    max_price: initialFilters.max_price || '',
    is_verified: initialFilters.is_verified || '',
    is_renting: initialFilters.is_renting || '',
    is_blank: initialFilters.is_blank || '',
    max_people: initialFilters.max_people || '',
    sort_by: initialFilters.sort_by || '-created_at'
  });

  useEffect(() => {
    if (visible) {
      setFilters({
        type: initialFilters.type || '',
        min_price: initialFilters.min_price || '',
        max_price: initialFilters.max_price || '',
        is_verified: initialFilters.is_verified || '',
        is_renting: initialFilters.is_renting || '',
        is_blank: initialFilters.is_blank || '',
        max_people: initialFilters.max_people || '',
        sort_by: initialFilters.sort_by || '-created_at'
      });
    }
  }, [visible, initialFilters]);

  const handleReset = () => {
    if (mode === 'list') {
      setFilters({
        type: '',
        min_price: '',
        max_price: '',
        is_verified: '',
        is_renting: '',
        is_blank: '',
        max_people: '',
        sort_by: '-created_at'
      });
    } else {
      setFilters({
        type: '',
        min_price: '',
        max_price: '',
        is_verified: '',
        is_renting: '',
        max_people: '',
        is_blank: '',
        sort_by: '-created_at'
      });
    }
  };

  const handleApply = () => {
    onApply(filters);
  };

  const houseTypes = [
    { label: 'Tất cả', value: '' },
    { label: 'Nhà riêng', value: 'house' },
    { label: 'Chung cư', value: 'apartment' },
    { label: 'Ký túc xá', value: 'dormitory' },
    { label: 'Phòng trọ', value: 'room' },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: '-created_at' },
    { label: 'Cũ nhất', value: 'created_at' },
    { label: 'Giá thấp nhất', value: '-base_price' },
    { label: 'Giá cao nhất', value: 'base_price' },
    { label: 'Đánh giá cao', value: '-rating' },
    { label: 'Đánh giá thấp', value: 'rating' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.backgroundPrimary }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Bộ lọc tìm kiếm {mode === 'map' ? 'bản đồ' : ''}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <ScrollView style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                Loại nhà
              </Text>
              <View style={styles.typeChipsContainer}>
                {houseTypes.map((type) => (
                  <Chip
                    key={type.value}
                    mode="outlined"
                    onPress={() => setFilters({ ...filters, type: type.value })}
                    style={styles.typeChip}
                    selected={filters.type === type.value}
                    selectedColor={colors.accentColor}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                Số người ở tối đa:
              </Text>
              <TextInput
                label="Số người tối đa"
                value={filters.max_people}
                onChangeText={(value) => (value >= 0 && value <= 50)? setFilters({ ...filters, max_people: value }) : 1}
                keyboardType="numeric"
                style={styles.priceInput}
                mode="outlined"
                right={<TextInput.Affix text="người" />}
              />
            </View>

            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                Khoảng giá
              </Text>
              
              <View style={styles.priceInputContainer}>
                <TextInput
                  label="Từ"
                  value={filters.min_price}
                  onChangeText={(value) => setFilters({ ...filters, min_price: value })}
                  keyboardType="numeric"
                  style={styles.priceInput}
                  mode="outlined"
                  right={<TextInput.Affix text="VNĐ" />}
                />
                
                <Text style={{ marginHorizontal: 8, alignSelf: 'center', color: colors.textSecondary }}>
                  -
                </Text>
                
                <TextInput
                  label="Đến"
                  value={filters.max_price}
                  onChangeText={(value) => setFilters({ ...filters, max_price: value })}
                  keyboardType="numeric"
                  style={styles.priceInput}
                  mode="outlined"
                  right={<TextInput.Affix text="VNĐ" />}
                />
              </View>
              
              <View style={styles.priceChipsContainer}>
                <Chip 
                  mode="outlined" 
                  onPress={() => setFilters({ ...filters, min_price: '1000000', max_price: '3000000' })}
                  style={styles.priceChip}
                  selectedColor={colors.accentColor}
                >
                  1-3 triệu
                </Chip>
                <Chip 
                  mode="outlined" 
                  onPress={() => setFilters({ ...filters, min_price: '3000000', max_price: '5000000' })}
                  style={styles.priceChip}
                  selectedColor={colors.accentColor}
                >
                  3-5 triệu
                </Chip>
                <Chip 
                  mode="outlined" 
                  onPress={() => setFilters({ ...filters, min_price: '5000000', max_price: '10000000' })}
                  style={styles.priceChip}
                  selectedColor={colors.accentColor}
                >
                  5-10 triệu
                </Chip>
                <Chip 
                  mode="outlined" 
                  onPress={() => setFilters({ ...filters, min_price: '10000000', max_price: '' })}
                  style={styles.priceChip}
                  selectedColor={colors.accentColor}
                >
                  &gt; 10 triệu
                </Chip>
              </View>
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            <View style={styles.filterSection}>
              <View style={styles.switchContainer}>
                <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                  Chỉ hiện nhà đã xác thực
                </Text>
                <Switch
                  value={filters.is_verified === true}
                  onValueChange={(value) => setFilters({ ...filters, is_verified: value ? true : '' })}
                  color={colors.accentColor}
                />
              </View>
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            <View style={styles.filterSection}>
              <View style={styles.switchContainer}>
                <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                  Chỉ hiện nhà còn cho thuê
                </Text>
                <Switch
                  value={filters.is_renting === true}
                  onValueChange={(value) => setFilters({ ...filters, is_renting: value ? true : '' })}
                  color={colors.accentColor}
                />
              </View>
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            <View style={styles.filterSection}>
              <View style={styles.switchContainer}>
                <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                  Chỉ hiện nhà có phòng trống
                </Text>
                <Switch
                  value={filters.is_blank === true}
                  onValueChange={(value) => setFilters({ ...filters, is_blank: value ? true : '' })}
                  color={colors.accentColor}
                />
              </View>
            </View>
            
            {mode === 'list' && (
              <>
                <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
                
                <View style={styles.filterSection}>
                  <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                    Sắp xếp theo
                  </Text>
                  
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        filters.sort_by === option.value && {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.accentColor,
                          borderWidth: 1,
                        }
                      ]}
                      onPress={() => setFilters({ ...filters, sort_by: option.value })}
                    >
                      <Text 
                        style={[
                          styles.sortOptionText, 
                          { color: filters.sort_by === option.value ? colors.accentColor : colors.textPrimary }
                        ]}
                      >
                        {option.label}
                      </Text>
                      {filters.sort_by === option.value && (
                        <Icon name="check" size={20} color={colors.accentColor} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={[styles.footerButton, { borderColor: colors.borderColor }]}
              labelStyle={{ color: colors.textPrimary }}
            >
              Đặt lại
            </Button>
            
            <Button
              mode="contained"
              onPress={handleApply}
              style={[styles.footerButton, { backgroundColor: colors.accentColor }]}
            >
              Áp dụng
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filtersContainer: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  typeChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    margin: 4,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
  },
  priceChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceChip: {
    margin: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
  },
});
