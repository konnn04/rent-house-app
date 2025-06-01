import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PostTypeSelector = ({ selectedType, onSelectType, colors, isOwner }) => {
  // Define available post types based on user role
  const postTypes = [
    {
      id: 'question',
      title: 'Câu hỏi',
      icon: 'help-circle',
      description: 'Đặt câu hỏi về nhà thuê, phòng trọ',
      available: true, // Available for all users
    },
    {
      id: 'news',
      title: 'Tin tức',
      icon: 'newspaper',
      description: 'Chia sẻ tin tức về thị trường bất động sản',
      available: true, // Available for all users
    },
    {
      id: 'rental_listing',
      title: 'Cho thuê',
      icon: 'home',
      description: 'Đăng tin cho thuê nhà hoặc phòng',
      available: isOwner, // Only available for owners
    },
  ];

  // Filter post types based on availability
  const availablePostTypes = postTypes.filter((type) => type.available);

  return (
    <View style={styles.container}>
      {availablePostTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeButton,
            selectedType === type.id && styles.selectedTypeButton,
            {
              backgroundColor:
                selectedType === type.id
                  ? colors.accentColor
                  : colors.backgroundSecondary,
              borderColor:
                selectedType === type.id ? colors.accentColor : colors.borderColor,
            },
          ]}
          onPress={() => onSelectType(type.id)}
        >
          <Icon
            name={type.icon}
            size={24}
            color={selectedType === type.id ? '#fff' : colors.textSecondary}
          />
          <Text
            style={[
              styles.typeButtonText,
              { color: selectedType === type.id ? '#fff' : colors.textPrimary },
            ]}
          >
            {type.title}
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
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  selectedTypeButton: {
    borderWidth: 1,
  },
  typeButtonText: {
    marginTop: 5,
    fontWeight: '500',
    fontSize: 12,
  },
});
