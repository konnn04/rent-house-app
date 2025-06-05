import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';

export const ChatHeader = ({ chatData, onBackPress, onInfoPress }) => {
  const { colors } = useTheme();
  const { userData } = useUser();
  
  const getDisplayName = () => {
    if (!chatData) return '';
    
    if (chatData.is_group) {
      return chatData.name || 'Nhóm chat';
    }
    
    return chatData.members_summary?.find(member => 
      member.id !== userData?.id
    )?.full_name || 'Chat';
  };
  
  const getSubtitle = () => {
    if (!chatData) return '';
    
    if (chatData.is_group) {
      return `${chatData.members?.length || 0} thành viên`;
    }
    
    return '';
  };
  
  return (
    <View style={[styles.header, { backgroundColor: colors.backgroundPrimary }]}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onBackPress}
      >
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {getDisplayName()}
        </Text>
        {getSubtitle() ? (
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {getSubtitle()}
          </Text>
        ) : null}
      </View>
      
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onInfoPress}
      >
        <Icon name="information-outline" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    height: 60,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  }
});
