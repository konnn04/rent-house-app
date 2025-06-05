import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { API_BASE_URL, CLIENT_ID, CLIENT_SECRET } from "../constants/Config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'RentHouseApp/1.0',
  },
});

export const checkStatusFromServer = async () => {
  try {
    const response = await apiClient.get('/api/ping/');
    return response.data;
  } catch (error) {
    console.error("Error checking server status:", error);
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
  }
}

export async function refreshToken() {
  try {
    const refresh_token = await AsyncStorage.getItem("refresh_token");
    if (!refresh_token) throw new Error("No refresh token");
    const response = await axios.post(`${API_BASE_URL}/o/token/`, {
      grant_type: 'refresh_token',
      refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });
    await AsyncStorage.setItem("access_token", response.data.access_token);
    await AsyncStorage.setItem("refresh_token", response.data.refresh_token);
    return response.data.access_token;
  } catch (error) {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    throw error;
  }
}

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token") || '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        if (typeof window !== "undefined" && window.location) {
          window.location.replace('/login');
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
