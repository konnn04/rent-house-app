import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { homeStyles } from '../../../../styles/style';

const ProfileHeader = ({ title = 'Tài khoản' }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.headerTop}>
        <Text style={[homeStyles.title, { color: colors.textPrimary, fontSize: 28 }]}>
          {title}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')} 
          style={homeStyles.themeButton}
        >
          <Ionicons 
            name="settings-outline" 
            size={24} 
            color={colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ProfileHeader;