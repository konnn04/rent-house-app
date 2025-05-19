import { useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { HouseCard } from '../../../main/houses/components/HouseCard';

export const ListView = ({
  houses,
  refreshing,
  onRefresh,
  loadingMore,
  onLoadMore,
  hasMore
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Handle house selection
  const handleHousePress = (house) => {
    navigation.navigate('HouseDetail', { houseId: house.id });
  };

  // Render loading footer for pagination
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginLeft: 10 }}>
          Đang tải thêm...
        </Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="home-search" size={60} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Không tìm thấy nhà/căn hộ nào
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Hãy thử tìm kiếm với các điều kiện khác
      </Text>
    </View>
  );

  return (
    <FlatList
      data={houses}
      keyExtractor={(item, index) => item.id.toString() + index}
      renderItem={({ item }) => (
        <View style={styles.houseCardContainer}>
          <HouseCard house={item} onPress={() => handleHousePress(item)}/>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={hasMore ? onLoadMore : null}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  houseCardContainer: {
    marginBottom: 16,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
  },
});
