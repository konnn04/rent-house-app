import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  changeUserPasswordService,
  checkIdentityVerificationStatusService,
  getCurrentUserService,
  updateUserAvatarService,
  updateUserProfileService
} from "../services/userService";
import { useAuth } from './AuthContext';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { userToken } = useAuth(); 
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userToken) {  
      loadUserData();
    } else {
      setUserData(null);
    }
  }, [userToken]);  

  const loadUserData = async () => {
    try {
      setLoading(true);

      const cachedUserData = await AsyncStorage.getItem('user_data');
      if (cachedUserData) {
        setUserData(JSON.parse(cachedUserData));
      }

      await fetchUserData();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUserService();
      setUserData(data);
      // Lưu cache
      await AsyncStorage.setItem('user_data', JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };
  
  const checkIdentityVerification = async () => {
    if (!userData || userData.role !== 'owner') return null;
    
    try {
      setLoading(true);
      const status = await checkIdentityVerificationStatusService();
      return status;
    } catch (error) {
      console.error('Error checking identity verification:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfile = async (formData) => {
    try {
      setLoading(true);
      const data = await updateUserProfileService(formData);
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

  const updateAvatar = async (avatarFormData) => {
    try {
      setLoading(true);

      const data = await updateUserAvatarService(avatarFormData);

      const updatedUserData = {
        ...userData,
        avatar: data.avatar,
        avatar_thumbnail: data.avatar_thumbnail
      };

      setUserData(updatedUserData);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));

      return { success: true, data: data };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

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

  const clearUserData = async () => {
    try {
      setUserData(null);
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const contextValue = {
    userData,
    loading,
    error,
    fetchUserData,
    updateUserProfile,
    updateAvatar,
    changeUserPassword,
    clearUserData,
    checkIdentityVerification
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;