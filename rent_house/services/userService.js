import { apiClient } from './Api';

// Lấy thông tin người dùng hiện tại
export const getCurrentUserService = async () => {
  try {
    const response = await apiClient.get('/api/users/current-user/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw new Error('Không thể lấy thông tin người dùng hiện tại');
  }
};
 

// Cập nhật thông tin người dùng
export const updateUserProfileService = async (formData) => {
  try {
    const response = await apiClient.patch('/api/users/current-user/', formData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Không thể cập nhật thông tin người dùng');
  }
};

// Cập nhật avatar người dùng
export const updateUserAvatarService = async (avatarFormData) => {
  try {
    const response = await apiClient.patch('/api/users/update-avatar/', avatarFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw new Error('Không thể cập nhật avatar người dùng');
  }
};


// Đổi mật khẩu người dùng
export const changeUserPasswordService = async (currentPassword, newPassword) => {
  try {
    const formData = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    const response = await apiClient.post('/api/users/change-password/', formData);
    return response.data;
  } catch (error) {
    console.error('Error changing user password:', error);
    throw new Error('Không thể đổi mật khẩu người dùng');
  }
};

// Gửi thông tin xác thực danh tính người dùng
export const submitIdentityVerificationService = async (formData) => {
  try {
    const response = await apiClient.post('/api/identity-verification/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting identity verification:', error);
    throw error;
  }
};

// Kiểm tra trạng thái xác thực danh tính
export const checkIdentityVerificationStatusService = async () => {
  try {
    const response = await apiClient.get('/api/identity-verification/status/');
    return response.data;
  } catch (error) {
    console.error('Error checking identity verification status:', error);
    throw error;
  }
};
