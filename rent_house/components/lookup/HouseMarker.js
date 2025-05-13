import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/Tools';

export const HouseMarker = ({ house }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loadError, setLoadError] = useState(false);

  // Handle navigate to house detail
  const handlePress = () => {
    navigation.navigate('HouseDetail', { houseId: house.id });
  };

  // Map house types to icons
//   const getHouseTypeIcon = (type) => {
//     switch (type) {
//       case 'apartment':
//         return require('@assets/icons/apartment-marker.png');
//       case 'house':
//         return require('@assets/icons/house-marker.png');
//       case 'villa':
//         return require('@assets/icons/villa-marker.png');
//       case 'dormitory':
//         return require('@assets/icons/dormitory-marker.png');
//       case 'studio':
//         return require('@assets/icons/studio-marker.png');
//       default:
//         return require('@assets/icons/house-marker.png');
//     }
//   };

  return (
    <Marker
      coordinate={{
        latitude: house.latitude,
        longitude: house.longitude,
      }}
      title={house.title}
      description={`${formatCurrency(house.base_price)}/tháng`}
      onCalloutPress={handlePress}
      // Custom marker icon based on house type
      // Note: If you don't have these icons, you can remove this and use the default marker
    //   image={getHouseTypeIcon(house.type)}
    >
      {/* Custom marker */}
      <View style={[styles.markerContainer, { backgroundColor: colors.accentColor }]}>
        <Text style={styles.markerPrice}>
          {house.base_price / 1000000}M
        </Text>
      </View>
      
      <Callout tooltip onPress={handlePress}>
        <View style={[styles.calloutContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Image
            source={{ uri: house.thumbnail }}
            style={styles.calloutImage}
            onError={() => setLoadError(true)}
            defaultSource={require('@assets/images/default-house.png')}
          />
          
          <View style={styles.calloutContent}>
            <Text 
              style={[styles.calloutTitle, { color: colors.textPrimary }]} 
              numberOfLines={1}
            >
              {house.title}
            </Text>
            
            <Text 
              style={[styles.calloutAddress, { color: colors.textSecondary }]} 
              numberOfLines={2}
            >
              {house.address}
            </Text>
            
            <Text style={[styles.calloutPrice, { color: colors.accentColor }]}>
              {formatCurrency(house.base_price)}/tháng
            </Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 8,
  },
  markerPrice: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutContainer: {
    width: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calloutImage: {
    width: '100%',
    height: 120,
  },
  calloutContent: {
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    marginBottom: 6,
  },
  calloutPrice: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
