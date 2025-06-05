import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useTheme } from '../../../../contexts/ThemeContext';

export const SearchBar = ({ value, onChangeText }) => {
  const { colors } = useTheme();
  return (
    <Searchbar
      placeholder="Tìm kiếm người dùng..."
      onChangeText={onChangeText}
      value={value}
      style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}
      inputStyle={{ color: colors.textPrimary }}
      iconColor={colors.textSecondary}
      placeholderTextColor={colors.textSecondary}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
});
