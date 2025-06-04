import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';

export const RateFilterOptions = ({ selectedFilter, onFilterChange }) => {
  const { colors } = useTheme();
  
  // Filter options for ratings (0 = all, 1-5 = specific star count)
  const filterOptions = [
    { value: 0, label: 'Tất cả' },
    { value: 5, label: '5 sao' },
    { value: 4, label: '4 sao' },
    { value: 3, label: '3 sao' },
    { value: 2, label: '2 sao' },
    { value: 1, label: '1 sao' },
  ];
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filterOptions.map((option) => (
        <Chip
          key={option.value}
          selected={selectedFilter === option.value}
          onPress={() => onFilterChange(option.value)}
          style={[
            styles.filterChip,
            selectedFilter === option.value && { backgroundColor: colors.accentColor }
          ]}
          textStyle={{
            color: selectedFilter === option.value ? 'white' : colors.textPrimary
          }}
        >
          {option.value > 0 && (
            <View style={styles.starContainer}>
              {Array.from({ length: option.value }).map((_, index) => (
                <Icon 
                  key={index} 
                  name="star" 
                  size={14} 
                  color={selectedFilter === option.value ? 'white' : '#FFD700'} 
                  style={styles.starIcon}
                />
              ))}
            </View>
          )}
          {option.label}
        </Chip>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  filterChip: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 36,
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  starIcon: {
    marginRight: 2,
  }
});
