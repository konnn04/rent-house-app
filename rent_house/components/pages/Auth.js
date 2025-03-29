import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles, authStyles } from '../../styles/style';
import { useTheme } from '../../contexts/ThemeContext';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { colors } = useTheme();
  const dynamicAuthStyles = authStyles(colors);

  const handleLogin = () => {
    navigation.navigate('main');
  };

  return (
    <View style={[styles.authContainer, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={[dynamicAuthStyles.authTitle, { color: colors.textPrimary }]}>RENT HOUSE</Text>
      <Text style={[dynamicAuthStyles.authSubtitle, { color: colors.textSecondary }]}>Welcome back!</Text>
      <TextInput
        style={[styles.input, { 
          borderColor: colors.borderColor,
          color: colors.textPrimary,
          backgroundColor: colors.backgroundSecondary
        }]}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, {
          borderColor: colors.textSecondary,
          color: colors.textPrimary,
          backgroundColor: colors.backgroundSecondary
        }]}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.accentColor }]}
        onPress={handleLogin}
      >
        <Text style={[
          styles.buttonText, 
          { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' }
        ]} >Login</Text>
      </TouchableOpacity>
    </View>
  );
}