import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../utils/Fetch';

// Component hiển thị thành viên
const MemberItem = ({ member, isCurrentUser, isAdmin, onRemoveMember }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.memberItem, { borderBottomColor: colors.borderColor }]}>
      <Image 
        source={{ uri: member.user.avatar_thumbnail || 'https://via.placeholder.com/50' }} 
        style={styles.memberAvatar} 
      />
      
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.textPrimary }]}>
          {member.user.full_name}{isCurrentUser ? ' (Bạn)' : ''}
        </Text>
        <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
          {member.is_admin ? 'Quản trị viên' : 'Thành viên'}
        </Text>
      </View>
      
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

export const ChatInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { userData } = useUser();
  
  const chatId = route.params?.chatId;
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Kiểm tra xem người dùng hiện tại có phải là admin không
  const isCurrentUserAdmin = useCallback(() => {
    if (!chatData || !userData) return false;
    
    const currentMembership = chatData.members?.find(
      member => member.user.id === userData.id
    );
    
    return currentMembership?.is_admin || false;
  }, [chatData, userData]);
  
  // Fetch chat info
  const fetchChatInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/chats/${chatId}/`);
      setChatData(response.data);
      
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
    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc muốn xóa ${member.user.full_name} khỏi nhóm chat này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/chats/${chatId}/remove_member/`, {
                user_id: member.user.id
              });
              
              // Refresh chat info
              fetchChatInfo();
              
            } catch (err) {
              console.error('Error removing member:', err);
              Alert.alert('Lỗi', 'Không thể xóa thành viên. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };
  
  // Handle leave group
  const handleLeaveGroup = () => {
    Alert.alert(
      'Rời nhóm',
      'Bạn có chắc muốn rời khỏi nhóm chat này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Rời nhóm', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/chats/${chatId}/leave_group/`);
              
              // Quay lại màn hình danh sách chat
              navigation.navigate('Chats');
              
            } catch (err) {
              console.error('Error leaving group:', err);
              Alert.alert('Lỗi', 'Không thể rời nhóm. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };
  
  // Handle add member
  const handleAddMember = () => {
    navigation.navigate('AddMembers', { chatId: chatId });
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
        {/* Thông tin nhóm */}
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
        
        {/* Danh sách thành viên */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Thành viên
            </Text>
            
            {chatData?.is_group && isCurrentUserAdmin() && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddMember}
              >
                <Icon name="account-plus" size={24} color={colors.accentColor} />
              </TouchableOpacity>
            )}
          </View>
          
          {chatData?.members?.map(member => (
            <MemberItem 
              key={member.id}
              member={member}
              isCurrentUser={member.user.id === userData?.id}
              isAdmin={isCurrentUserAdmin()}
              onRemoveMember={handleRemoveMember}
            />
          ))}
        </View>
        
        {/* Options */}
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
});