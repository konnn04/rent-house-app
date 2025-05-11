import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';
import { authStyles } from '../../../styles/style';
import { resendVerificationCode as resendCode, verifyEmail } from '../../../utils/Authentication';

export default function Verify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Countdown timer state - 30 minutes = 1800 seconds
  const [timeRemaining, setTimeRemaining] = useState(1800);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { username, email, userId } = route.params || {};
  const { colors } = useTheme();
  const styles = authStyles(colors);

  // Countdown timer effect
  useEffect(() => {
    // Only start countdown if there's time remaining
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Cleanup on component unmount
    return () => clearInterval(timer);
  }, [timeRemaining]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (isLoading) return;
    
    // Basic validation
    if (!verificationCode.trim()) {
      setError('Vui lòng nhập mã xác thực');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Call API to verify email
      const response = await verifyEmail(email, verificationCode);
      // Show success message
      setSuccess('Xác thực tài khoản thành công!');
      // Navigate to login after a short delay
      setTimeout(() => {
        navigation.navigate('Login', {
          verified: true,
          message: 'Xác thực tài khoản thành công. Vui lòng đăng nhập.'
        });
      }, 1500);
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || timeRemaining > 0) return;
    
    setIsResending(true);
    setError('');
    
    try {
      // Call API to resend verification code
      await resendCode(email);
      
      // Reset timer to 30 minutes
      setTimeRemaining(1800);
      
      // Show success message
      setSuccess('Đã gửi lại mã xác thực. Vui lòng kiểm tra email của bạn.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Resend code error:', error);
      setError(error.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={[styles.authContainer, localStyles.container]}>
      <Text style={styles.authTitle}>RENT HOUSE</Text>
      <Text style={styles.authSubtitle}>Xác thực tài khoản</Text>
      
      {/* Email instruction */}
      <Text style={[styles.authSubtitle, { textAlign: 'center' }]}>
        Vui lòng nhập mã xác thực được gửi tới email{' '}
        <Text style={localStyles.emailText}>{email}</Text>
      </Text>
      
      {/* Countdown timer */}
      <View style={localStyles.timerContainer}>
        <Text style={[localStyles.timerLabel, { color: colors.textSecondary }]}>
          Mã xác thực có hiệu lực trong:
        </Text>
        <Text style={[
          localStyles.timer, 
          timeRemaining < 300 ? localStyles.timerWarning : null,
          { color: timeRemaining < 300 ? colors.dangerColor : colors.accentColor }
        ]}>
          {formatTime(timeRemaining)}
        </Text>
      </View>
      
      {/* Verification code input */}
      <TextInput
        style={[styles.input, localStyles.codeInput]}
        placeholder="Mã xác thực"
        placeholderTextColor={colors.textSecondary}
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
      
      {/* Error message */}
      {error ? 
        <Text style={[styles.errorText, localStyles.message]}>
          {error}
        </Text> 
      : null}
      
      {/* Success message */}
      {success ? 
        <Text style={[localStyles.successText, localStyles.message]}>
          {success}
        </Text> 
      : null}
      
      {/* Verify button */}
      <TouchableOpacity
        style={[styles.button, localStyles.verifyButton]}
        onPress={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Xác thực</Text>
        )}
      </TouchableOpacity>
      
      {/* Resend button - disabled when timer is active */}
      <TouchableOpacity 
        onPress={handleResendCode}
        disabled={timeRemaining > 0 || isResending}
        style={[
          localStyles.resendButton,
          timeRemaining > 0 ? localStyles.resendDisabled : null
        ]}
      >
        {isResending ? (
          <ActivityIndicator color={colors.textSecondary} size="small" />
        ) : (
          <Text style={[
            localStyles.resendText, 
            { 
              color: timeRemaining > 0 ? colors.textDisabled : colors.textSecondary,
              opacity: timeRemaining > 0 ? 0.5 : 1
            }
          ]}>
            {timeRemaining > 0 
              ? `Gửi lại mã sau (${formatTime(timeRemaining)})` 
              : 'Gửi lại mã xác thực'}
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Back to login button */}
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={localStyles.backButton}
      >
        Quay lại đăng nhập
      </Button>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
  },
  emailText: {
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerWarning: {
    fontWeight: 'bold',
  },
  codeInput: {
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 5,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginVertical: 10,
  },
  successText: {
    color: '#198754',
  },
  verifyButton: {
    height: 50,
    justifyContent: 'center',
  },
  resendButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  resendText: {
    textAlign: 'center',
  },
  resendDisabled: {
    opacity: 0.5,
  },
  backButton: {
    marginTop: 20,
  }
});