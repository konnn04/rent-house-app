import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { userData, updateUserProfile, loading: contextLoading } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState({});
  
  // Load user data when component mounts or userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone_number: userData.phone_number || '',
      });
    }
  }, [userData]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Vui lòng nhập họ';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Vui lòng nhập tên';
    }

    const phoneRegex = /^0\d{9}$/;
    if (!formData.phone_number.trim() || !phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await updateUserProfile(formData);
    setLoading(false);
    
    if (result.success) {
      Alert.alert(
        'Thành công',
        'Thông tin cá nhân đã được cập nhật',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      // Handle validation errors from server
      if (result.error) {
        setErrors(result.error);
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      }
    }
  };

  // Giữ nguyên phần return của component
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cập nhật thông tin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Họ</Text>
          <TextInput
            value={formData.first_name}
            onChangeText={(text) => handleInputChange('first_name', text)}
            style={[styles.input, { backgroundColor: colors.backgroundSecondary }]}
            mode="outlined"
            outlineColor={colors.borderColor}
            activeOutlineColor={colors.accentColor}
            error={!!errors.first_name}
          />
          {errors.first_name && (
            <Text style={styles.errorText}>{errors.first_name}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Tên</Text>
          <TextInput
            value={formData.last_name}
            onChangeText={(text) => handleInputChange('last_name', text)}
            style={[styles.input, { backgroundColor: colors.backgroundSecondary }]}
            mode="outlined"
            outlineColor={colors.borderColor}
            activeOutlineColor={colors.accentColor}
            error={!!errors.last_name}
          />
          {errors.last_name && (
            <Text style={styles.errorText}>{errors.last_name}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Số điện thoại</Text>
          <TextInput
            value={formData.phone_number}
            onChangeText={(text) => handleInputChange('phone_number', text)}
            style={[styles.input, { backgroundColor: colors.backgroundSecondary }]}
            mode="outlined"
            keyboardType="phone-pad"
            outlineColor={colors.borderColor}
            activeOutlineColor={colors.accentColor}
            error={!!errors.phone_number}
          />
          {errors.phone_number && (
            <Text style={styles.errorText}>{errors.phone_number}</Text>
          )}
        </View>

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
            loading={loading || contextLoading}
            disabled={loading || contextLoading}
            style={[styles.actionButton, { backgroundColor: colors.accentColor }]}
          >
            Lưu thay đổi
          </Button>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 20,
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

export default EditProfileScreen;