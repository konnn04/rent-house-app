import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { verifyToken } from '../utils/Authentication';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    setIsLoading(true);
    try {
      const isValid = await verifyToken();
      if (isValid) {
        const token = await AsyncStorage.getItem('access_token');
        setUserToken(token);
      } else {
        setUserToken(null);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setUserToken(null);
    }
    setIsLoading(false);
  };

  // Sửa hàm signIn để nhận trực tiếp token thay vì gọi lại login
  const signIn = async (token) => {
    try {
      setUserToken(token);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signOut = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, signIn, signOut, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);