import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { styles } from '../../../styles/style';

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={{ color: colors.textPrimary }}>Profile Screen</Text>
      
      <TouchableOpacity 
        style={[profileStyles.logoutButton, { backgroundColor: colors.accentColor }]} 
        onPress={signOut}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const profileStyles = StyleSheet.create({
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  }
});

export default ProfileScreen;