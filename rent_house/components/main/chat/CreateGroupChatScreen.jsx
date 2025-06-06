import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';
import { createGroupChatService } from '../../../services/chatService';
import { PaperDialog } from '../../common/PaperDialog';

export const CreateGroupChatScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [usernames, setUsernames] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });

  const handleAddUsername = () => setUsernames([...usernames, '']);
  const handleRemoveUsername = (idx) => setUsernames(usernames.filter((_, i) => i !== idx));
  const handleUsernameChange = (idx, value) => setUsernames(usernames.map((u, i) => i === idx ? value : u));

  const handleCreateGroup = async () => {
    if (!groupName.trim() || usernames.filter(u => u.trim()).length < 2) {
      setDialogContent({
        title: 'Lỗi',
        message: 'Nhập tên nhóm và ít nhất 2 username.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
      return;
    }
    setLoading(true);
    try {
      const group = await createGroupChatService(groupName, usernames.filter(u => u.trim()));
      navigation.replace('Chat', {
        chatId: group.id,
        chatName: group.name,
        userId: group.user_id
      });
    } catch (error) {
      setDialogContent({
        title: 'Lỗi',
        message: error?.response?.data?.detail || 'Không thể tạo nhóm chat.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Tạo nhóm chat mới</Text>
      <TextInput
        style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderColor }]}
        placeholder="Tên nhóm"
        placeholderTextColor={colors.textSecondary}
        value={groupName}
        onChangeText={setGroupName}
      />
      <Text style={[styles.label, { color: colors.textPrimary }]}>Thành viên (username):</Text>
      {usernames.map((username, idx) => (
        <View key={idx} style={styles.usernameRow}>
          <TextInput
            style={[styles.input, { flex: 1, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="Username"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={v => handleUsernameChange(idx, v)}
            autoCapitalize="none"
          />
          {usernames.length > 1 && (
            <TouchableOpacity onPress={() => handleRemoveUsername(idx)} style={styles.removeBtn}>
              <Text style={{ color: colors.dangerColor }}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Button mode="outlined" onPress={handleAddUsername} style={{ marginVertical: 10 }}>
        Thêm thành viên
      </Button>
      <Button mode="contained" loading={loading} onPress={handleCreateGroup} style={{ marginTop: 20 }}>
        Tạo nhóm chat
      </Button>
      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        content={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  removeBtn: { marginLeft: 8, padding: 4 },
});
