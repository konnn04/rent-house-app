import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { authStyles, styles } from '../../styles/style';
import { login } from '../../utils/Authentication';

export default function Auth() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const { colors } = useTheme();
  const dynamicAuthStyles = authStyles(colors);

  const handleLogin = () => {
    setMessage(''); // Clear previous message
    // Validate input
    if (!usernameOrEmail || !password) {
      setMessage('Please fill in all fields');
      return;
    }
    // Call the login function from utils/Authentication.js
    login(usernameOrEmail, password)
      .then(() => {
        navigation.navigate('main'); // Navigate to Home screen on success
      })
      .catch((error) => {
        console.error('Login error:', error);
        setMessage('Invalid username or password');
      });

  };

  return (
    <View style={[styles.authContainer, { backgroundColor: colors.backgroundPrimary }]}>
      <View>
        <Text style={[dynamicAuthStyles.authTitle, { color: colors.textPrimary, marginBottom: 0 }]}>RENT</Text>
        <Text style={[dynamicAuthStyles.authTitle, { color: colors.textPrimary }]}>HOUSE</Text>
        <Text style={[dynamicAuthStyles.authSubtitle, { color: colors.textSecondary }]}>Welcome back!</Text>
        <TextInput
          style={[styles.input, {
            borderColor: colors.borderColor,
            color: colors.textPrimary,
            backgroundColor: colors.backgroundSecondary
          }]}
          placeholder="Username or Email"
          placeholderTextColor={colors.textSecondary}
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
        />
        <TextInput
          style={[styles.input, {
            borderColor: colors.borderColor,
            color: colors.textPrimary,
            backgroundColor: colors.backgroundSecondary
          }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/* Handle exception */}
        {message && <Text style={dynamicAuthStyles.errorText}>{message}</Text>}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accentColor }]}
          onPress={handleLogin}
        >
          <Text style={[
            styles.buttonText,
            { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' }
          ]} >Login</Text>
        </TouchableOpacity>
      
      <View>
      </View>
      <Text style={[dynamicAuthStyles.authSubtitle, { color: colors.textSecondary, margin: 0 }]}
      > Or </Text>
        <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.accentColor, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }]}>
          <Icon name="google" size={20} color={colors.textPrimary} />
          <Text style={[
            styles.buttonText,
            { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' }
          ]} >Login with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}