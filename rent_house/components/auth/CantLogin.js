import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { resendActivation, resetPasswordRequest } from '../../utils/Authentication';

export  function CantLogin() {
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('reset'); // 'reset' or 'activate'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigation = useNavigation();
  const { colors } = useTheme();
  const paperTheme = usePaperTheme();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    if (isLoading) return;

    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate email
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
      // Call API to request password reset
      await resetPasswordRequest(email);
      setSuccess('Yêu cầu đặt lại mật khẩu đã được gửi tới email của bạn');
      
      // Clear email input after successful request
      setEmail('');
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAccount = async () => {
    if (isLoading) return;

    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate email
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
      // Call API to resend activation code
      await resendActivation(email);
      
      // Navigate to verification screen with email
      navigation.navigate('Verify', { email });
    } catch (error) {
      console.error('Activation request error:', error);
      setError(error.message || 'Không thể gửi yêu cầu kích hoạt. Vui lòng thử lại sau.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Logo and Header */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Hỗ Trợ Đăng Nhập</Text>
      <Text style={styles.subtitle}>
        Chúng tôi sẽ giúp bạn truy cập lại tài khoản
      </Text>

      {/* Tab selection */}
      <View style={styles.tabContainer}>
        <Button
          mode={activeTab === 'reset' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('reset')}
          style={[styles.tabButton, activeTab === 'reset' && { backgroundColor: colors.accentColor }]}
        >
          Quên mật khẩu
        </Button>
        <Button
          mode={activeTab === 'activate' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('activate')}
          style={[styles.tabButton, activeTab === 'activate' && { backgroundColor: colors.accentColor }]}
        >
          Kích hoạt tài khoản
        </Button>
      </View>

      {/* Email input */}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Help text based on active tab */}
      <Card style={styles.helpCard}>
        <Card.Content>
          <Text style={{ color: colors.textSecondary }}>
            {activeTab === 'reset' 
              ? 'Nhập địa chỉ email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu qua email.'
              : 'Nhập địa chỉ email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi lại mã kích hoạt cho tài khoản của bạn.'}
          </Text>
        </Card.Content>
      </Card>

      {/* Error message */}
      {error ? (
        <HelperText type="error" visible={true} style={styles.message}>
          {error}
        </HelperText>
      ) : null}

      {/* Success message */}
      {success ? (
        <HelperText type="info" visible={true} style={styles.successMessage}>
          {success}
        </HelperText>
      ) : null}

      {/* Action button */}
      <Button
        mode="contained"
        onPress={activeTab === 'reset' ? handleResetPassword : handleActivateAccount}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {isLoading 
          ? 'Đang xử lý...' 
          : activeTab === 'reset' 
            ? 'Gửi yêu cầu đặt lại mật khẩu' 
            : 'Gửi lại mã kích hoạt'}
      </Button>

      {/* Back to login */}
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
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 25,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
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