import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';
import { apiClient } from '../../../services/Api'; // Thêm dòng này để gọi API thêm thành viên
import { getInfoChatService, leaveChatService } from '../../../services/chatService';
import { getChatDetailsFromRoute } from '../../../utils/ChatUtils';
import { PaperDialog } from '../../common/PaperDialog';
const MemberItem = ({ member, isCurrentUser, isAdmin, onRemoveMember, onViewProfile }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.memberItem, { borderBottomColor: colors.borderColor }]}>
      <Image 
        source={{ uri: member.avatar_thumbnail || 'https://via.placeholder.com/50' }} 
        style={styles.memberAvatar} 
      />
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.textPrimary }]}>
          {member.full_name}{isCurrentUser ? ' (Bạn)' : ''}
        </Text>
        <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
          {member.is_admin ? 'Quản trị viên' : 'Thành viên'}
        </Text>
      </View>
      {!isCurrentUser && (
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => onViewProfile(member.username)}
        >
          <Icon name="account-circle-outline" size={24} color={colors.accentColor} />
        </TouchableOpacity>
      )}
      {!isCurrentUser && isAdmin && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => onRemoveMember(member)}
        >
          <Icon name="account-remove" size={24} color={colors.dangerColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const ChatInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { userData } = useUser();
  
  const { chatId } = getChatDetailsFromRoute(route);
  console.log('Chat ID:', chatId);
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });
  
  const isCurrentUserAdmin = useCallback(() => {
    if (!chatData || !userData) return false;
    
    const currentMembership = chatData.members?.find(
      member => member.id === userData.id
    );
    
    return currentMembership?.is_admin || false;
  }, [chatData, userData]);
  
  const fetchChatInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const infoChat = await getInfoChatService(chatId);
      setChatData(infoChat);

    } catch (err) {
      console.error('Error fetching chat info:', err);
      setError('Không thể tải thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [chatId]);
  
  useEffect(() => {
    fetchChatInfo();
  }, [fetchChatInfo]);
  
  // Handle remove member
  const handleRemoveMember = (member) => {
    setDialogContent({
      title: 'Xóa thành viên',
      message: `Bạn có chắc muốn xóa ${member.full_name} khỏi nhóm chat này?`,
      actions: [
        { label: 'Hủy', onPress: () => setDialogVisible(false) },
        { 
          label: 'Xóa', 
          onPress: async () => {
            try {
              await apiClient.post(`/api/chats/${chatId}/remove_member/`, {
                user_id: member.id
              });
              fetchChatInfo();
              setDialogVisible(false);
            } catch (err) {
              setDialogContent({
                title: 'Lỗi',
                message: 'Không thể xóa thành viên. Vui lòng thử lại sau.',
                actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
              });
              setDialogVisible(true);
            }
          },
          isDestructive: true
        }
      ]
    });
    setDialogVisible(true);
  };
  
  const handleLeaveGroup = () => {
    setDialogContent({
      title: 'Rời nhóm',
      message: 'Bạn có chắc muốn rời khỏi nhóm chat này?',
      actions: [
        { label: 'Hủy', onPress: () => setDialogVisible(false) },
        { 
          label: 'Rời nhóm',
          onPress: async () => {
            try {
              await leaveChatService(chatId);
              setDialogVisible(false);
              navigation.navigate('Chats');
            } catch (err) {
              setDialogContent({
                title: 'Lỗi',
                message: 'Không thể rời nhóm. Vui lòng thử lại sau.',
                actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
              });
              setDialogVisible(true);
            }
          },
          isDestructive: true
        }
      ]
    });
    setDialogVisible(true);
  };
  
  const handleAddMember = () => {
    navigation.navigate('AddMembers', { chatId: chatId });
  };

  const handleViewProfile = (username) => {
    navigation.navigate('PublicProfile', { username });
  };

  const handleAddMemberByUsername = async () => {
    if (!addUsername.trim()) return;
    setAddMemberLoading(true);
    try {
      await apiClient.post(`/api/chats/${chatId}/add_member_by_username/`, {
        username: addUsername.trim()
      });
      setAddUsername('');
      setShowAddMember(false);
      fetchChatInfo();
      setDialogContent({
        title: 'Thành công',
        message: 'Đã thêm thành viên vào nhóm!',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    } catch (err) {
      setDialogContent({
        title: 'Lỗi',
        message: err?.response?.data?.detail || 'Không thể thêm thành viên. Kiểm tra username!',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    } finally {
      setAddMemberLoading(false);
    }
  };
  
  // Render
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông tin chat</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông tin chat</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
            onPress={fetchChatInfo}
          >
            <Text style={{ color: 'white' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông tin chat</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView>
        <View style={[styles.groupInfo, { backgroundColor: colors.backgroundSecondary }]}>
          {chatData?.is_group ? (
            <>
              <Text style={[styles.groupName, { color: colors.textPrimary }]}>
                {chatData.name}
              </Text>
              {chatData.description && (
                <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
                  {chatData.description}
                </Text>
              )}
              <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
                {chatData.members?.length || 0} thành viên
              </Text>
            </>
          ) : (
            <Text style={[styles.groupName, { color: colors.textPrimary }]}>
              Chat trực tiếp
            </Text>
          )}
        </View>
        
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Thành viên
            </Text>
            
            {chatData?.is_group && isCurrentUserAdmin() && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddMember(true)}
              >
                <Icon name="account-plus" size={24} color={colors.accentColor} />
              </TouchableOpacity>
            )}
          </View>
          
          {chatData?.members_summary?.map(member => (
            <MemberItem 
              key={member.id}
              member={member}
              isCurrentUser={member.id === userData?.id}
              isAdmin={isCurrentUserAdmin()}
              onRemoveMember={handleRemoveMember}
              onViewProfile={handleViewProfile}
            />
          ))}
        </View>
        
        {chatData?.is_group && (
          <TouchableOpacity 
            style={[styles.leaveButton, { backgroundColor: colors.dangerColor }]}
            onPress={handleLeaveGroup}
          >
            <Icon name="exit-to-app" size={20} color="white" />
            <Text style={styles.leaveButtonText}>Rời nhóm chat</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      {showAddMember && (
        <View style={[styles.addMemberModal, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={{ color: colors.textPrimary, fontWeight: 'bold', marginBottom: 10 }}>Thêm thành viên bằng username</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={addUsername}
              onChangeText={setAddUsername}
              placeholder="Nhập username"
              style={[styles.addMemberInput, { color: colors.textPrimary, borderColor: colors.borderColor }]
              }
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.addMemberBtn, { backgroundColor: colors.accentColor }]}
              onPress={handleAddMemberByUsername}
              disabled={addMemberLoading}
            >
              {addMemberLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Icon name="plus" size={22} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addMemberBtn, { backgroundColor: colors.dangerColor, marginLeft: 8 }]}
              onPress={() => setShowAddMember(false)}
            >
              <Icon name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        message={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  groupInfo: {
    padding: 20,
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  memberCount: {
    fontSize: 14,
  },
  membersSection: {
    margin: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 14,
  },
  removeButton: {
    padding: 5,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 20,
    borderRadius: 5,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profileButton: {
    padding: 5,
    marginRight: 5,
  },
  addMemberModal: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 120,
    zIndex: 100,
    borderRadius: 10,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  addMemberInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    minWidth: 120,
  },
  addMemberBtn: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});