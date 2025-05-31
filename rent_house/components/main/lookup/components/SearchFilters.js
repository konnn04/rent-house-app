import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Chip, Divider, SegmentedButtons, Switch, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';

export const SearchFilters = ({
  visible,
  onClose,
  onApply,
  initialFilters = {}
}) => {
  const { colors } = useTheme();
  const [filters, setFilters] = useState({
    type: initialFilters.type || '',
    min_price: initialFilters.min_price || '',
    max_price: initialFilters.max_price || '',
    area: initialFilters.area || '',
    has_rooms: initialFilters.has_rooms || false,
    ordering: initialFilters.ordering || '-created_at'
  });

  // Update filters when initialFilters change
  useEffect(() => {
    if (visible) {
      setFilters({
        type: initialFilters.type || '',
        min_price: initialFilters.min_price || '',
        max_price: initialFilters.max_price || '',
        area: initialFilters.area || '',
        has_rooms: initialFilters.has_rooms || false,
        ordering: initialFilters.ordering || '-created_at'
      });
    }
  }, [visible, initialFilters]);

  // Handle reset filters
  const handleReset = () => {
    setFilters({
      type: '',
      min_price: '',
      max_price: '',
      area: '',
      has_rooms: false,
      ordering: '-created_at'
    });
  };

  // Handle apply filters
  const handleApply = () => {
    onApply(filters);
  };

  // House types for selection
  const houseTypes = [
    { label: 'Tất cả', value: '' },
    { label: 'Nhà riêng', value: 'house' },
    { label: 'Chung cư', value: 'apartment' },
    { label: 'Biệt thự', value: 'villa' },
    { label: 'Ký túc xá', value: 'dormitory' },
    { label: 'Studio', value: 'studio' },
  ];

  // Areas for selection (example data, can be expanded)
  const areas = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp',
    'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
    'Quận Thủ Đức', 'Huyện Bình Chánh', 'Huyện Cần Giờ',
    'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'
  ];

  // Sorting options
  const sortOptions = [
    { label: 'Mới nhất', value: '-created_at' },
    { label: 'Cũ nhất', value: 'created_at' },
    { label: 'Giá thấp nhất', value: 'base_price' },
    { label: 'Giá cao nhất', value: '-base_price' },
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Bộ lọc tìm kiếm
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          <ScrollView style={styles.filtersContainer}>
            {/* House Type Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                Loại nhà
              </Text>
              <SegmentedButtons
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
                buttons={houseTypes.map(type => ({
                  value: type.value,
                  label: type.label,
                  checkedColor: colors.accentColor,
                  uncheckedColor: colors.textSecondary,
                }))}
                style={styles.segmentedButtons}
              />
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            {/* Price Range Filter */}
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
              
              {/* Quick price selection */}
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
            
            {/* Area Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                Khu vực
              </Text>
              
              <TextInput
                label="Tìm kiếm khu vực"
                value={filters.area}
                onChangeText={(value) => setFilters({ ...filters, area: value })}
                style={styles.areaInput}
                mode="outlined"
              />
              
              <View style={styles.areaChipsContainer}>
                {areas.slice(0, 12).map((area) => (
                  <Chip
                    key={area}
                    mode="outlined"
                    onPress={() => setFilters({ ...filters, area })}
                    style={styles.areaChip}
                    selected={filters.area === area}
                    selectedColor={colors.accentColor}
                  >
                    {area}
                  </Chip>
                ))}
              </View>
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            {/* Available Rooms Filter */}
            <View style={styles.filterSection}>
              <View style={styles.switchContainer}>
                <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                  Chỉ hiện nhà có phòng trống
                </Text>
                <Switch
                  value={filters.has_rooms}
                  onValueChange={(value) => setFilters({ ...filters, has_rooms: value })}
                  color={colors.accentColor}
                />
              </View>
            </View>
            
            <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
            
            {/* Sorting */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                Sắp xếp theo
              </Text>
              
              <SegmentedButtons
                value={filters.ordering}
                onValueChange={(value) => setFilters({ ...filters, ordering: value })}
                buttons={sortOptions.map(option => ({
                  value: option.value,
                  label: option.label,
                  checkedColor: colors.accentColor,
                  uncheckedColor: colors.textSecondary,
                }))}
                style={styles.segmentedButtons}
              />
            </View>
          </ScrollView>
          
          <Divider style={{ backgroundColor: colors.borderColor }} />
          
          {/* Footer with buttons */}
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
  segmentedButtons: {
    marginBottom: 8,
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
  areaInput: {
    marginBottom: 16,
  },
  areaChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  areaChip: {
    margin: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
