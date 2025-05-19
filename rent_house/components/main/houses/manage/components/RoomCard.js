import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../../contexts/ThemeContext';
import { formatCurrency } from '../../../../../utils/Tools';

export const RoomCard = ({ room, onPress }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <Image
              source={{ 
                uri: room.thumbnail || 'https://via.placeholder.com/100x100?text=No+Image'
              }}
              style={styles.image}
              defaultSource={require('@assets/logo.png')}
            />
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {room.title || `Phòng ${room.id}`}
            </Text>
            
            <Text style={[styles.price, { color: colors.accentColor }]} numberOfLines={1}>
              {formatCurrency(room.price || 0)} / tháng
            </Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Icon name="ruler-square" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {room.area || 0} m²
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="bed" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {room.bedrooms || 1}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="shower" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {room.bathrooms || 1}
                </Text>
              </View>
            </View>
            
            <View style={styles.occupancyContainer}>
              <Chip 
                icon="account-multiple" 
                style={[
                  styles.chip,
                  { 
                    backgroundColor: 
                      room.cur_people >= room.max_people 
                        ? colors.dangerLight 
                        : colors.backgroundPrimary
                  }
                ]}
              >
                <Text style={{ color: colors.textSecondary }}>
                  {room.cur_people || 0}/{room.max_people || 1} người
                </Text>
              </Chip>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 5,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 3,
  },
  occupancyContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  chip: {
    height: 26,
  },
});
