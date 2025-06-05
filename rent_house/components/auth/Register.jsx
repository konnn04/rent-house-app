import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Checkbox,
  HelperText,
  SegmentedButtons,
  TextInput
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { RegistrationAvatar } from './RegistrationAvatar';

export function Register() {
  const { register, preRegister } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('renter');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    avatar: ''
  });
  
  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      clearTimeout(countdownRef.current);
    }
    return () => clearTimeout(countdownRef.current);
  }, [countdown]);

  const handleAvatarChange = (avatarData) => {
    setAvatar(avatarData);
    if (fieldErrors.avatar) {
      setFieldErrors(prev => ({ ...prev, avatar: '' }));
    }
  };

  const handleSendCode = async () => {
    if (isSendingCode || countdown > 0) return;
    setCodeMessage('');
    setError('');
    setFieldErrors(prev => ({ ...prev, email: '' }));
    if (!email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: 'Vui lòng nhập email' }));
      return;
    }
    setIsSendingCode(true);
    try {
      const result = await preRegister(email.trim());
      setIsCodeSent(true);
      setCodeMessage(result.message || 'Mã xác thực đã được gửi đến email của bạn.');
      setCountdown(60);
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.email) {
          setFieldErrors(prev => ({ ...prev, email: errorData.email.join(' ') }));
        } else {
          setError(errorData.detail || errorData.message || 'Gửi mã xác thực thất bại');
        }
      } else {
        setError(error.message || 'Gửi mã xác thực thất bại');
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (isSendingCode || countdown > 0) return;
    setCodeMessage('');
    setError('');
    setFieldErrors(prev => ({ ...prev, email: '' }));
    setIsSendingCode(true);
    try {
      const result = await preRegister(email.trim());
      setCodeMessage(result.message || 'Mã xác thực mới đã được gửi đến email của bạn.');
      setCountdown(60);
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.email) {
          setFieldErrors(prev => ({ ...prev, email: errorData.email.join(' ') }));
        } else {
          setError(errorData.detail || errorData.message || 'Gửi lại mã xác thực thất bại');
        }
      } else {
        setError(error.message || 'Gửi lại mã xác thực thất bại');
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (error) {
      setError('');
    }
    
    switch (field) {
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'username': setUsername(value); break;
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'verificationCode': setVerificationCode(value); break;
    }
  };

  const handleRegister = async () => {
    if (isLoading) return;
    
    setError('');
    setFieldErrors({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
      avatar: ''
    });
    
    let hasValidationErrors = false;
    const newFieldErrors = { ...fieldErrors };
    
    if (!firstName.trim()) {
      newFieldErrors.firstName = 'Vui lòng nhập họ';
      hasValidationErrors = true;
    }
    
    if (!lastName.trim()) {
      newFieldErrors.lastName = 'Vui lòng nhập tên';
      hasValidationErrors = true;
    }
    
    if (!username.trim()) {
      newFieldErrors.username = 'Vui lòng nhập tên đăng nhập';
      hasValidationErrors = true;
    }
    
    if (!email.trim()) {
      newFieldErrors.email = 'Vui lòng nhập email';
      hasValidationErrors = true;
    }
    
    if (!phone.trim()) {
      newFieldErrors.phone = 'Vui lòng nhập số điện thoại';
      hasValidationErrors = true;
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      newFieldErrors.phone = 'Số điện thoại không hợp lệ';
      hasValidationErrors = true;
    }
    
    if (!password) {
      newFieldErrors.password = 'Vui lòng nhập mật khẩu';
      hasValidationErrors = true;
    }
    
    if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      hasValidationErrors = true;
    }
    
    if (!verificationCode.trim()) {
      newFieldErrors.verificationCode = 'Vui lòng nhập mã xác thực';
      hasValidationErrors = true;
    }

    if (!avatar) {
      newFieldErrors.avatar = 'Vui lòng chọn avatar';
      hasValidationErrors = true;
    }

    if (!termsAccepted) {
      setError('Vui lòng đồng ý với điều khoản sử dụng');
      hasValidationErrors = true;
    }
    
    if (hasValidationErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('password2', confirmPassword);
      formData.append('email', email);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('phone_number', phone);
      formData.append('role', role);
      formData.append('verification_code', verificationCode);
      
      if (avatar) {
        formData.append('avatar', {
          uri: avatar.uri,
          type: avatar.type || 'image/jpeg',
          name: avatar.name || 'avatar.jpg'
        });
      }
      
      const result = await register(formData);
      
      if (result && result.message) {
        setIsSuccess(true);
        setSuccessMessage(result.message || 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        
        setFirstName('');
        setLastName('');
        setUsername('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setAvatar(null);
        setTermsAccepted(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const newFieldErrors = { ...fieldErrors };
        let hasFieldErrors = false;
        
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            let uiField = field;
            if (field === 'phone_number') uiField = 'phone';
            if (field === 'verification_code') uiField = 'verificationCode';
            newFieldErrors[uiField] = errorData[field].join(' ');
            hasFieldErrors = true;
          } else if (typeof errorData[field] === 'string') {
            let uiField = field;
            if (field === 'phone_number') uiField = 'phone';
            if (field === 'verification_code') uiField = 'verificationCode';
            newFieldErrors[uiField] = errorData[field];
            hasFieldErrors = true;
          }
        });
        
        if (hasFieldErrors) {
          setFieldErrors(newFieldErrors);
        } else {
          setError(errorData.detail || errorData.message || 'Đăng ký thất bại');
        }
      } else {
        setError(error.message || 'Đăng ký thất bại, vui lòng thử lại sau');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary, padding: 20 }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={[styles.title, { color: colors.textPrimary }]}>RENT HOUSE</Text>
        <Text style={[styles.subtitle, { color: colors.successColor, fontWeight: 'bold', marginVertical: 20 }]}>
          Đăng ký thành công!
        </Text>
        
        <View style={[styles.successContainer, { backgroundColor: colors.successLight, padding: 20, borderRadius: 10 }]}>
          <Icon name="check-circle" size={60} color={colors.successColor} style={{ alignSelf: 'center', marginBottom: 15 }} />
          <Text style={{ color: colors.textPrimary, textAlign: 'center', marginBottom: 20 }}>
            {successMessage}
          </Text>
        </View>
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={[styles.button, { marginTop: 30 }]}
        >
          Đăng nhập ngay
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.backgroundPrimary}]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Logo and Header */}
      {/* <View style={styles.logoContainer}>
        <Image
          source={require('@assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View> */}
      
      <Text style={[styles.title, { color: colors.textPrimary }]}>RENT HOUSE</Text>
      <Text style={[styles.subtitle, { color: colors.textPrimary }]}>Đăng ký tài khoản mới</Text>
      <View style={styles.formContainer}>
        <RegistrationAvatar 
          onAvatarChange={handleAvatarChange}
          error={fieldErrors.avatar}
        />
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Bạn là:</Text>
        <SegmentedButtons
          value={role}
          onValueChange={setRole}
          style={styles.segmentedButtons}
          buttons={[
            {
              value: 'renter',
              label: 'Người thuê',
            },
            {
              value: 'owner',
              label: 'Chủ nhà',
            },
          ]}
        />
 
        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <TextInput
              label="Họ"
              value={firstName}
              onChangeText={(text) => handleFieldChange('firstName', text)}
              style={[styles.halfInput, fieldErrors.firstName ? styles.inputError : null]}
              mode="outlined"
            />
            {fieldErrors.firstName ? (
              <HelperText type="error" visible={true}>
                {fieldErrors.firstName}
              </HelperText>
            ) : null}
          </View>
          
          <View style={styles.halfInputContainer}>
            <TextInput
              label="Tên"
              value={lastName}
              onChangeText={(text) => handleFieldChange('lastName', text)}
              style={[styles.halfInput, fieldErrors.lastName ? styles.inputError : null]}
              mode="outlined"
            />
            {fieldErrors.lastName ? (
              <HelperText type="error" visible={true}>
                {fieldErrors.lastName}
              </HelperText>
            ) : null}
          </View>
        </View>
        
        <TextInput
          label="Tên đăng nhập"
          value={username}
          onChangeText={(text) => handleFieldChange('username', text)}
          style={[styles.input, fieldErrors.username ? styles.inputError : null]}
          mode="outlined"
          autoCapitalize="none"
        />
        {fieldErrors.username ? (
          <HelperText type="error" visible={true}>
            {fieldErrors.username}
          </HelperText>
        ) : null}
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => handleFieldChange('email', text)}
          style={[styles.input, fieldErrors.email ? styles.inputError : null]}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSendingCode}
        />
        {fieldErrors.email ? (
          <HelperText type="error" visible={true}>
            {fieldErrors.email}
          </HelperText>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 2 }}>
            <TextInput
              label="Mã xác thực"
              value={verificationCode}
              onChangeText={(text) => handleFieldChange('verificationCode', text)}
              style={[
                styles.input,
                fieldErrors.verificationCode ? styles.inputError : null,
                { marginBottom: 0 }
              ]}
              mode="outlined"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <View style={{ width: 10 }} />
          <Button
            mode="outlined"
            onPress={isCodeSent ? handleResendCode : handleSendCode}
            loading={isSendingCode}
            disabled={isSendingCode || !email.trim() || countdown > 0}
            style={{ flex: 1, minWidth: 100 }}
            contentStyle={{ paddingVertical: 4 }}
          >
            {isSendingCode
              ? 'Đang gửi...'
              : isCodeSent
                ? (countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã')
                : 'Gửi mã'
            }
          </Button>
        </View>
        {fieldErrors.verificationCode ? (
          <HelperText type="error" visible={true}>
            {fieldErrors.verificationCode}
          </HelperText>
        ) : null}
        {codeMessage ? (
          <HelperText type="info" visible={true}>
            {codeMessage}
          </HelperText>
        ) : null}

        <TextInput
          label="Số điện thoại"
          value={phone}
          onChangeText={(text) => handleFieldChange('phone', text)}
          style={[styles.input, fieldErrors.phone ? styles.inputError : null]}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
        />
        {fieldErrors.phone ? (
          <HelperText type="error" visible={true}>
            {fieldErrors.phone}
          </HelperText>
        ) : null}
        
        <TextInput
          label="Mật khẩu"
          value={password}
          onChangeText={(text) => handleFieldChange('password', text)}
          style={[styles.input, fieldErrors.password ? styles.inputError : null]}
          mode="outlined"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)} 
            />
          }
        />
        {fieldErrors.password ? (
          <HelperText type="error" visible={true}>
            {fieldErrors.password}
          </HelperText>
        ) : null}
        
        <TextInput
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={(text) => handleFieldChange('confirmPassword', text)}
          style={[styles.input, fieldErrors.confirmPassword ? styles.inputError : null]}
          mode="outlined"
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon 
              icon={showConfirmPassword ? "eye-off" : "eye"} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
            />
          }
        />
        {fieldErrors.confirmPassword ? (
          <HelperText type="error" visible={true}>
            {fieldErrors.confirmPassword}
          </HelperText>
        ) : null}
        
        
      </View>
      
      <View style={styles.termsContainer}>
        <Checkbox
          status={termsAccepted ? 'checked' : 'unchecked'}
          onPress={() => setTermsAccepted(!termsAccepted)}
          color={colors.primary}
        />
        <Text 
          style={[styles.termsText, { color: colors.textPrimary }]}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          Tôi đồng ý với{' '}
          <Text 
            style={styles.termsLink}
            onPress={() => {/* Chính sách gì gì đó */}}
          >
            Điều khoản sử dụng
          </Text>{' '}
          của Rent House
        </Text>
      </View>
      
      {error ? (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {error}
        </HelperText>
      ) : null}
      
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={isLoading}
        disabled={isLoading || !isCodeSent}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
      
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={styles.linkButton}
      >
        Đã có tài khoản? Đăng nhập
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
    width: 100,
    height: 100,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: 10,
  },
  formContainer: {
    marginTop: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  halfInput: {
    marginBottom: 0,
  },
  input: {
    marginBottom: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 5,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  termsText: {
    flex: 1,
    marginLeft: 10,
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 5,
    fontSize: 14,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 5,
  },
  successContainer: {
    marginVertical: 20,
    alignItems: 'center',
    padding: 15,
  },
});