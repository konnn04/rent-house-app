import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { changeUserPassword, loading: contextLoading } = useUser();

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.current_password) {
      newErrors.current_password = 'Mật khẩu hiện tại là bắt buộc';
    }
    if (!formData.new_password) {
      newErrors.new_password = 'Mật khẩu mới là bắt buộc';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    }
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Xác nhận mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await changeUserPassword(formData.current_password, formData.new_password);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được thay đổi thành công',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      if (result.error) {
        setErrors(result.error);
      } else {
        Alert.alert('Lỗi', 'Không thể thay đổi mật khẩu. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={[styles.header, { backgroundColor: colors.accentColorLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Đổi mật khẩu</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.formContainer} 
          contentContainerStyle={{ paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Mật khẩu hiện tại</Text>
            <TextInput
              value={formData.current_password}
              onChangeText={(text) => handleInputChange('current_password', text)}
              secureTextEntry={!showCurrentPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.borderColor}
              activeOutlineColor={colors.accentColor}
              error={!!errors.current_password}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
            />
            {errors.current_password && (
              <Text style={styles.errorText}>{errors.current_password}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Mật khẩu mới</Text>
            <TextInput
              value={formData.new_password}
              onChangeText={(text) => handleInputChange('new_password', text)}
              secureTextEntry={!showNewPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.borderColor}
              activeOutlineColor={colors.accentColor}
              error={!!errors.new_password}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
            />
            {errors.new_password && (
              <Text style={styles.errorText}>{errors.new_password}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Xác nhận mật khẩu mới</Text>
            <TextInput
              value={formData.confirm_password}
              onChangeText={(text) => handleInputChange('confirm_password', text)}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.borderColor}
              activeOutlineColor={colors.accentColor}
              error={!!errors.confirm_password}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
            {errors.confirm_password && (
              <Text style={styles.errorText}>{errors.confirm_password}</Text>
            )}
          </View>

          <Text style={[styles.passwordHint, { color: colors.textSecondary }]}>
            * Mật khẩu phải có ít nhất 8 ký tự.
          </Text>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={[styles.actionButton, { borderColor: colors.borderColor }]}
              labelStyle={{ color: colors.textPrimary }}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={[styles.actionButton, { backgroundColor: colors.accentColor }]}
            >
              Lưu thay đổi
            </Button>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  passwordHint: {
    fontSize: 12,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
