import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';

export const PaperDialog = ({
  visible,
  onDismiss,
  title,
  content,
  actions = [],
  contentStyle,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        {title && (
          <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        )}
        <Dialog.Content style={[styles.content, contentStyle]}>
          {typeof content === 'string' ? (
            <Paragraph>{content}</Paragraph>
          ) : (
            content
          )}
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onPress={action.onPress}
              mode={action.mode || 'text'}
              color={action.color}
            >
              {action.label}
            </Button>
          ))}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export const showDialog = (
  title,
  content,
  buttons = [{ text: 'OK', onPress: () => {} }],
  options = {}
) => {
  console.warn('showDialog needs to be implemented with a state management solution');
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 8,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  actions: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
