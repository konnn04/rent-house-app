import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';

export const UserListItem = ({ user, onPress }) => {
  const { colors } = useTheme();
  
  const getRoleIcon = () => {
    if (user.role === 'owner') {
      return { name: 'home', color: colors.accentColor };
    } else {
      return { name: 'account', color: colors.textSecondary };
    }
  };
  
  const roleIcon = getRoleIcon();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      onPress={onPress}
    >
      <Image 
        source={{ uri: user.avatar || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
        defaultSource={require('@assets/images/default-avatar.png')}
      />
      
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {user.first_name} {user.last_name}
          </Text>
          {user.is_verified && (
            <Icon name="check-decagram" size={16} color={colors.accentColor} style={styles.verifiedIcon} />
          )}
        </View>
        
        <Text style={[styles.username, { color: colors.textSecondary }]}>
          @{user.username}
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name={roleIcon.name} size={14} color={roleIcon.color} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {user.role === 'owner' ? 'Chủ nhà' : 'Người thuê'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="post" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {user.post_count || 0} bài
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="account-group" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {user.follower_count || 0} người theo dõi
            </Text>
          </View>
        </View>
      </View>
      
      <Icon name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
