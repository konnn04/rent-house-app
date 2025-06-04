import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

export const PaperIconButton = ({
  icon,
  size = 24,
  color,
  onPress,
  style,
  disabled = false,
  ...props
}) => {
  return (
    <IconButton
      icon={icon}
      size={size}
      color={color}
      onPress={onPress}
      style={[styles.button, style]}
      disabled={disabled}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 0,
  },
});
