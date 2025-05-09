import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const SearchBar = ({ value, onChangeText }) => {
  const { colors } = useTheme();
  return (
    <TextInput
      style={[styles.searchBar, {color: colors.textPrimary} ]}
      borderColor={colors.borderColor}
      placeholder="Tìm kiếm người dùng..."
      placeholderTextColor= {colors.textSecondary}
      backgroundColor={colors.backgroundSecondary}
      value={value}
      onChangeText={onChangeText}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default SearchBar;