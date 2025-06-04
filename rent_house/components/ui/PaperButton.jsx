import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export const PaperButton = ({
  mode = 'contained',
  onPress,
  style,
  labelStyle,
  icon,
  loading = false,
  disabled = false,
  color,
  children,
  ...props
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      style={[styles.button, style]}
      labelStyle={[styles.label, labelStyle]}
      icon={icon}
      loading={loading}
      disabled={disabled}
      color={color}
      {...props}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
