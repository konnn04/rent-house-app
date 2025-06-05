import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '../../../../contexts/ThemeContext';

export const HouseMarker = ({ house, onMarkerPress }) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (onMarkerPress) {
      onMarkerPress(house.id);
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: house.latitude,
        longitude: house.longitude,
      }}
      onPress={handlePress}
    >
      <View style={[styles.markerContainer, { backgroundColor: colors.accentColor }]}>
        <Text style={styles.markerPrice}>
          {Math.round(house.base_price / 1000000)}M
        </Text>
      </View>
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
  }
});
