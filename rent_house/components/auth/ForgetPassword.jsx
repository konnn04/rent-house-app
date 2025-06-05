import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { resetPasswordRequest } from '../../services/authService';

export function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigation = useNavigation();
  const { colors } = useTheme();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    if (isLoading) return;

    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPasswordRequest(email);
      setSuccess(response.message || 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn (nếu email đã đăng ký).');
      
      setEmail('');
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('@assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>Quên mật khẩu</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu qua email
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Card style={[styles.helpCard, { backgroundColor: colors.backgroundSecondary }]}>
        <Card.Content>
          <Text style={{ color: colors.textSecondary }}>
            Nhập địa chỉ email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu qua email.
          </Text>
        </Card.Content>
      </Card>

      {error ? (
        <HelperText type="error" visible={true} style={styles.message}>
          {error}
        </HelperText>
      ) : null}

      {success ? (
        <HelperText type="info" visible={true} style={styles.successMessage}>
          {success}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleResetPassword}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu đặt lại mật khẩu'}
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={styles.backButton}
      >
        Quay lại đăng nhập
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    marginBottom: 15,
  },
  helpCard: {
    marginBottom: 20,
  },
  message: {
    textAlign: 'center',
    marginVertical: 10,
  },
  successMessage: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#198754',
  },
  button: {
    marginTop: 10,
    marginBottom: 15,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 10,
  }
});