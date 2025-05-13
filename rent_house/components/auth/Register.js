import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Checkbox,
  HelperText,
  SegmentedButtons,
  TextInput
} from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { register } from '../../utils/Authentication';

export  function Register() {
  // User information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('renter');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const navigation = useNavigation();
  const { colors } = useTheme();

  // Field change handlers with error clearing
  const handleFieldChange = (field, value) => {
    // Clear error for this field when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error as well
    if (error) {
      setError('');
    }
    
    // Update field value using dynamic approach
    switch (field) {
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'username': setUsername(value); break;
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
    }
  };

  const handleRegister = async () => {
    if (isLoading) return;
    
    // Reset all error states
    setError('');
    setFieldErrors({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    
    // Client-side validation
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
      // Attempt registration
      const result = await register(username, password, confirmPassword, email, firstName, lastName, phone, role);
      
      // If we got here, registration was successful
      // Check for success message format from the API
      if (result && result.message) {
        // Navigate to verify screen with all needed user details
        navigation.navigate('Verify', { 
          username, 
          email,
          firstName,
          lastName,
          phone,
          role,
          userId: result.user_id
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle field-specific errors from API
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const newFieldErrors = { ...fieldErrors };
        let hasFieldErrors = false;
        
        // Process each field error from the API response
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            // Join multiple error messages for the same field
            newFieldErrors[field] = errorData[field].join(' ');
            hasFieldErrors = true;
          } else if (typeof errorData[field] === 'string') {
            // Handle string error messages
            newFieldErrors[field] = errorData[field];
            hasFieldErrors = true;
          }
        });
        
        if (hasFieldErrors) {
          setFieldErrors(newFieldErrors);
        } else {
          // If it's not a field-specific error, show a general error
          setError(errorData.detail || errorData.message || 'Đăng ký thất bại');
        }
      } else {
        // Handle generic error
        setError(error.message || 'Đăng ký thất bại, vui lòng thử lại sau');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.backgroundPrimary}]}
      showsVerticalScrollIndicator={false}
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
      
      <Text style={[styles.title, { color: colors.textPrimary }]}>RENT HOUSE</Text>
      <Text style={[styles.subtitle, { color: colors.textPrimary }]}>Đăng ký tài khoản mới</Text>
      
      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Role Selection */}
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


        {/* Name Row */}
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
        
        {/* Username */}
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
        
        {/* Email */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => handleFieldChange('email', text)}
          style={[styles.input, fieldErrors.email ? styles.inputError : null]}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {fieldErrors.email ? (
          <HelperText type="error" visible={true}>
            {fieldErrors.email}
          </HelperText>
        ) : null}
        
        {/* Phone */}
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
        
        {/* Password */}
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
        
        {/* Confirm Password */}
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
      
      {/* Terms and Conditions */}
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
            onPress={() => {/* Navigate to Terms */}}
          >
            Điều khoản sử dụng
          </Text>{' '}
          của Rent House
        </Text>
      </View>
      
      {/* General error message */}
      {error ? (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {error}
        </HelperText>
      ) : null}
      
      {/* Register Button */}
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
      
      {/* Login Link */}
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
  }
});