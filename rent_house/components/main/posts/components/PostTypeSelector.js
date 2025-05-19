import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PostTypeSelector = ({ selectedType, onSelectType, colors }) => {
  // Available post types and their display information
  const postTypes = [
    {
      id: 'rental_listing',
      label: 'Cho thuê',
      icon: 'home-city',
      description: 'Đăng thông tin cho thuê nhà/phòng',
    },
    {
      id: 'search_listing',
      label: 'Tìm thuê',
      icon: 'magnify',
      description: 'Đăng thông tin tìm nhà/phòng để thuê',
    },
    {
      id: 'roommate',
      label: 'Tìm bạn ở ghép',
      icon: 'account-group',
      description: 'Đăng thông tin tìm bạn ở ghép',
    },
  ];

  return (
    <View style={styles.container}>
      {postTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeButton,
            {
              backgroundColor: selectedType === type.id 
                ? colors.accentColor 
                : colors.backgroundSecondary,
            },
          ]}
          onPress={() => onSelectType(type.id)}
        >
          <Icon
            name={type.icon}
            size={24}
            color={selectedType === type.id ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.typeLabel,
              {
                color: selectedType === type.id ? '#FFFFFF' : colors.textPrimary,
              },
            ]}
          >
            {type.label}
          </Text>
          <Text
            style={[
              styles.typeDescription,
              {
                color: selectedType === type.id
                  ? 'rgba(255,255,255,0.8)'
                  : colors.textSecondary,
              },
            ]}
            numberOfLines={2}
          >
            {type.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  typeButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    minHeight: 100,
  },
  typeLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
});
