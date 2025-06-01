import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  changeUserPasswordService,
  getCurrentUserService,
  updateUserAvatarService,
  updateUserProfileService
} from "../services/userService";
import { useAuth } from './AuthContext';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { userToken } = useAuth();  // Lấy trạng thái token từ AuthContext
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user data khi component mount HOẶC khi userToken thay đổi
  useEffect(() => {
    if (userToken) {  // Chỉ load dữ liệu khi có token
      loadUserData();
    } else {
      // Nếu không có token (đăng xuất), xóa dữ liệu user
      setUserData(null);
    }
  }, [userToken]);  // Thêm userToken vào dependency array

  // Hàm tải dữ liệu user từ cache (nếu có) hoặc từ API
  const loadUserData = async () => {
    try {
      setLoading(true);

      // Thử lấy dữ liệu từ AsyncStorage trước
      const cachedUserData = await AsyncStorage.getItem('user_data');
      if (cachedUserData) {
        setUserData(JSON.parse(cachedUserData));
      }

      // Sau đó vẫn gọi API để lấy dữ liệu mới nhất
      await fetchUserData();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API để lấy thông tin user
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUserService();
      setUserData(data);
      // Lưu cache
      await AsyncStorage.setItem('user_data', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật thông tin profile
  const updateUserProfile = async (formData) => {
    try {
      setLoading(true);
      const data = await updateUserProfileService(formData);

      // Cập nhật state và cache
      const updatedUserData = { ...userData, ...data };
      setUserData(updatedUserData);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data || { message: 'Không thể cập nhật thông tin' }
      };
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật avatar
  const updateAvatar = async (avatarFormData) => {
    try {
      setLoading(true);

      const data = await updateUserAvatarService(avatarFormData);

      // Cập nhật avatar trong state và cache
      const updatedUserData = {
        ...userData,
        avatar: data.avatar,
        avatar_thumbnail: data.avatar_thumbnail
      };

      setUserData(updatedUserData);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đổi mật khẩu
  const changeUserPassword = async (currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
      return { success: false, error: { message: 'Vui lòng nhập đầy đủ thông tin' } };
    }
    try {
      setLoading(true);
      const data = await changeUserPasswordService(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.response?.data
      };
    } finally {
      setLoading(false);
    }
  };

  // Xóa dữ liệu user khi đăng xuất
  const clearUserData = async () => {
    try {
      setUserData(null);
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  // Giá trị context sẽ được cung cấp
  const contextValue = {
    userData,
    loading,
    error,
    fetchUserData,
    updateUserProfile,
    updateAvatar,
    changeUserPassword,
    clearUserData
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;