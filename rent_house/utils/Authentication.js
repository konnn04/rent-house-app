import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_ID, CLIENT_SECRET } from "../constants/Config";
import { api } from "./Apis";

export const login = async (username, password) => {
  try {
    if (!username || username.trim() === '') {
      throw new Error('Vui lòng nhập tên đăng nhập');
    }
    
    if (!password || password.trim() === '') {
      throw new Error('Vui lòng nhập mật khẩu');
    }
    
    const formData = {
      username: username.trim(),
      password: password,
      grant_type: "password",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    };
    
    console.log("Attempting login with:", { username: formData.username, client_id: CLIENT_ID });

    console.log("Check verification status response:", checkVerify.data);

    const response = await api.post("/o/token/", formData);
    console.log("Login response:", response.data);
    
    const { access_token, refresh_token } = response.data;

    await AsyncStorage.setItem("access_token", access_token);
    await AsyncStorage.setItem("refresh_token", refresh_token);
    
    return response.data;
  } catch (error) {
    console.error("Login error details:", error.response?.data || error.message);
    throw new Error(
      "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại."
    );
  } 
};

export const register = async (username, password, confirmPassword, email, firstName, lastName, phone) => {
  try {
    const formData = {
      username: username.trim(),
      password: password,
      password2: confirmPassword,
      email: email,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    };
    
    const response = await api.post("/api/register/", formData);
    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyEmail = async (email, verificationCode) => {
  try {
    const formData = {
      email: email,
      code: verificationCode,
    };
    const response = await api.post("/api/verify-email/", formData);
    return response.data;
  } catch (error) {
    console.error("Email verification error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.non_field_errors[0] || "Xác thực thất bại. Vui lòng thử lại.");
  }
}

export const resetPasswordRequest = async (email) => {
  return;
}

export const resendActivation = async (email) => {
  try {
    const formData = {
      email: email,
    };
    const response = await api.post("/api/resend-verification/", formData);
    return response.data;
  } catch (error) {
    console.error("Resend activation error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.email[0] || "Không thể gửi yêu cầu kích hoạt. Vui lòng thử lại.");
  }
}

export const verifyToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      return false;
    }
    
    const response = await api.get("/api/users/current-user/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
};