import {
  StyleSheet
} from 'react-native';
import { Divider, Menu } from 'react-native-paper';
import { useTheme } from '../../../../contexts/ThemeContext';

export const MessageActions = ({ visible, onClose, onReply, onDelete, message, isCurrentUser, position }) => {
  const { colors } = useTheme();
  
  if (!visible || !message) return null;
  
  return (
    <Menu
      visible={visible}
      onDismiss={onClose}
      anchor={position}
      contentStyle={{ backgroundColor: colors.backgroundSecondary }}
    >
      <Menu.Item
        onPress={() => {
          onReply(message);
          onClose();
        }}
        title="Trả lời"
        leadingIcon="reply"
        titleStyle={{ color: colors.textPrimary }}
      />
      
      {isCurrentUser && (
        <>
          <Divider style={{ backgroundColor: colors.borderColor }} />
          <Menu.Item
            onPress={() => {
              onDelete(message);
              onClose();
            }}
            title="Xóa tin nhắn"
            leadingIcon="delete"
            titleStyle={{ color: colors.dangerColor }}
          />
        </>
      )}
    </Menu>
  );
};

const styles = StyleSheet.create({});
