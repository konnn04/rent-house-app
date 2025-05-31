import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useTheme } from '../../../../../contexts/ThemeContext';

export const ManageHeader = ({ title, showBack = false, onBackPress, right }) => {
  const { colors } = useTheme();
  
  return (
    <Appbar.Header style={[styles.header, { backgroundColor: colors.backgroundPrimary }]}>
      {showBack && (
        <Appbar.BackAction onPress={onBackPress} color={colors.textPrimary} />
      )}
      
      <Appbar.Content 
        title={<Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>}
      />
      
      {right}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
