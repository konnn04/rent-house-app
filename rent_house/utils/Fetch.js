import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

import { API_BASE_URL } from "../constants/Config";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "MyApp/1.0"
  }
});

export const checkInternetConnection = async () => {
  try {
    const response = await fetch(API_BASE_URL+'/api/ping/');
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

// Add token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token") || '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

