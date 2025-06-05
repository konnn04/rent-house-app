import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { setSignOutHandler } from '../services/Api';
import { loginService, preRegisterService, registerService, verifyTokenService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    setSignOutHandler(signOut);
    return () => setSignOutHandler(null);
  }, []);

  const signIn = async (username, password) => {
    try {
      const response = await loginService(username, password);
      const { access_token, refresh_token } = response;
      if (access_token) {
        await AsyncStorage.setItem('access_token', access_token);
        await AsyncStorage.setItem('refresh_token', refresh_token);
        setUserToken(access_token);
      } else {
        throw new Error('Login failed, no token received');
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed, please try again');
    }
  };

  const preRegister = async (email) => {
    try {
      const result = await preRegisterService(email);
      return result;
    } catch (error) {
      // Trả về lỗi dạng object để UI xử lý field error
      throw error;
    }
  };

  // Updated register function to handle FormData or individual parameters
  const register = async (formDataOrUsername, ...rest) => {
    try {
      let result;
      // Check if the first argument is FormData
      if (formDataOrUsername instanceof FormData) {
        result = await registerService(formDataOrUsername);
      } else {
        // For backward compatibility - handle the old way of passing parameters
        const [password, confirmPassword, email, firstName, lastName, phone, role, verificationCode] = rest;
        result = await registerService(
          formDataOrUsername,
          password,
          confirmPassword,
          email,
          firstName,
          lastName,
          phone,
          role,
          verificationCode
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const checkToken = async () => {
    setIsLoading(true);
    try {
      const isValid = await verifyTokenService();
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

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      setUserToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        signIn,
        signOut,
        preRegister,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;