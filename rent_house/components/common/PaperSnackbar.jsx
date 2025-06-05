import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

export const PaperSnackbar = ({
  visible,
  onDismiss,
  action,
  duration = 3000,
  style,
  children,
}) => {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      action={action}
      duration={duration}
      style={[styles.snackbar, style]}
    >
      {children}
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    borderRadius: 4,
    marginBottom: 70, 
  },
});
