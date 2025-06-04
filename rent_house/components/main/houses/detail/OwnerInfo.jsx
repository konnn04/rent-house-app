import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';

export const OwnerInfo = ({ owner }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  if (!owner) return null;
  
  // Handle visit profile
  const handleVisitProfile = () => {
    navigation.navigate('PublicProfile', { username: owner.username });
  };
  
  // Handle contact owner
  const handleContactOwner = () => {
    navigation.navigate('Chat', {
      screen: 'ChatDetail',
      params: { userId: owner.id, username: owner.username }
    });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Chủ nhà
      </Text>
      <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      
      <View style={styles.ownerContainer}>
        <Image
          source={{ uri: owner.avatar_thumbnail || 'https://via.placeholder.com/100' }}
          style={styles.ownerAvatar}
          defaultSource={require('@assets/images/default-avatar.png')}
        />
        
        <View style={styles.ownerDetails}>
          <Text style={[styles.ownerName, { color: colors.textPrimary }]}>
            {owner.full_name}
             <Icon
                name={owner.is_verified ? 'check-circle' : 'account'}
                size={16}
                color={owner.is_verified ? colors.successColor : colors.textSecondary}
              />
          </Text>
          
          <View style={styles.memberSince}>
            <Icon name="calendar" size={14} color={colors.textSecondary} />
            <Text style={[styles.memberSinceText, { color: colors.textSecondary }]}>
              Tham gia từ {new Date(owner.date_joined || Date.now()).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          
          <View style={styles.responseRate}>
            <Icon name="message-reply-text" size={14} color={colors.textSecondary} />
            <Text style={[styles.responseRateText, { color: colors.textSecondary }]}>
              Tỉ lệ phản hồi: {owner.response_rate || '98'}%
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          icon="account"
          onPress={handleVisitProfile}
          style={[styles.actionButton, { borderColor: colors.accentColor }]}
          labelStyle={{ color: colors.accentColor }}
        >
          Xem hồ sơ
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  divider: {
    marginBottom: 15,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ownerDetails: {
    marginLeft: 15,
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  memberSinceText: {
    fontSize: 12,
    marginLeft: 5,
  },
  responseRate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseRateText: {
    fontSize: 12,
    marginLeft: 5,
  },
  actionsContainer: {
    marginTop: 5,
  },
  actionButton: {
    marginHorizontal: 0,
  },
});
