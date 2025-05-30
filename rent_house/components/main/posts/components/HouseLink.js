import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '../../../../utils/Tools';

export const HouseLink = ({ house, onRemove, readOnly = false, colors }) => {
  const navigation = useNavigation();
  
  if (!house) return null;
  
  const handlePress = () => {
    navigation.navigate('HouseDetail', { houseId: house.id });
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: house.thumbnail || 'https://via.placeholder.com/100' }}
        style={styles.thumbnail}
        defaultSource={require('@assets/images/default-house.png')}
      />
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {house.title}
        </Text>
        
        <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
          {house.address}
        </Text>
        
        <Text style={[styles.price, { color: colors.accentColor }]}>
          {formatCurrency(house.base_price)} đ/tháng
        </Text>
      </View>
      
      {!readOnly && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Icon name="close-circle" size={20} color={colors.dangerColor} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    marginBottom: 4,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeButton: {
    padding: 10,
    justifyContent: 'center',
  }
});
