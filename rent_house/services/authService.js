import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_ID, CLIENT_SECRET } from '../constants/Config';
import { apiClient } from './Api';

export const loginService = async (username, password) => {
    if (!username || username.trim() === '') {
        throw new Error('Vui lòng nhập tên đăng nhập');
    }

    if (!password || password.trim() === '') {
        throw new Error('Vui lòng nhập mật khẩu');
    }
    try {
        const response = await apiClient.post('/o/token/', {
            username: username.trim(),
            password: password.trim(),
            grant_type: 'password',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác");
        }
        if (error.response?.status === 400) {
            throw new Error("Sai tài khoản hoặc mật khẩu");
        }
        if (error.response?.status === 500) {
            throw new Error("Lỗi máy chủ, vui lòng thử lại sau");
        }
        throw new Error("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
    }
};

export const logoutService = async () => {
    return;
};

export const verifyTokenService = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
        return false;
    }
    try {
        const response = await apiClient.get('/api/users/current-user/');
        return response.status === 200;
    } catch (error) {
        console.error("Xác thực token thất bại:", error);
        return false;
    }
};

// Tiền đăng ký: Nhập Email để nhận mã xác thực
export const preRegisterService = async (email) => {
  try {
    const response = await apiClient.post('/api/pre-register/', { email });
    return response.data;
  } catch (error) {
    // Trả về lỗi dạng object để context xử lý field error
    if (error.response && error.response.data) {
      throw { response: { data: error.response.data } };
    }
    throw error;
  }
};

// Đăng ký: Thông tin đầy đủ và mã xác thực
export const registerService = async (
  username,
  password,
  confirmPassword,
  email,
  firstName,
  lastName,
  phone,
  role,
  verificationCode
) => {
  try {
    const formData = {
      username: username.trim(),
      password: password,
      password2: confirmPassword,
      email: email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      role: role,
      verification_code: verificationCode,
    };
    const response = await apiClient.post("/api/register/", formData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw { response: { data: error.response.data } };
    }
    throw error;
  }
};

export const verifyEmail = async (email, verificationCode) => {
  try {
    const formData = {
      email: email,
      code: verificationCode,
    };
    const response = await apiClient.post("/api/verify-email/", formData);
    return response.data;
  } catch (error) {
    console.error("Email verification error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.non_field_errors[0] || "Xác thực thất bại. Vui lòng thử lại.");
  }
}

export const resetPasswordRequest = async (email) => {
  try {
    const response = await apiClient.post('/api/request-password-reset/', { email });
    return response.data;
  } catch (error) {
    console.error("Reset password request error:", error.response?.data || error.message);
    throw error;
  }
}

export const resendActivation = async (email) => {
  try {
    const formData = {
      email: email,
    };
    const response = await apiClient.post("/api/resend-verification/", formData);
    return response.data;
  } catch (error) {
    console.error("Resend activation error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.email[0] || "Không thể gửi yêu cầu kích hoạt. Vui lòng thử lại.");
  }
}

export const verifyIdentity = async (formData) => {
  try {
    const response = await apiClient.post('/api/users/verify-identity/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Identity verification error:", error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error("Vui lòng kiểm tra lại thông tin cung cấp");
    }
    throw error;
  }
};

export const checkVerificationStatus = async () => {
  try {
    const response = await apiClient.get('/api/users/verification-status/');
    return response.data;
  } catch (error) {
    console.error("Verification status check error:", error.response?.data || error.message);
    throw error;
  }
};

export const resendVerificationCode = async (email) => {
  try {
    const response = await apiClient.post('/api/resend-verification/', { email });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw { response: { data: error.response.data } };
    }
    throw error;
  }
};