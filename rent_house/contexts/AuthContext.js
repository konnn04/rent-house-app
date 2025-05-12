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

  const signIn = async (token) => {
    try {
      setUserToken(token);
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;