import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_ID, CLIENT_SECRET } from "../constants/Config";
import { api } from "./Apis";

export const login = async (username, password) => {
  try {
    const response = await api.post("/o/token/", {
        username: username,
        password: password,
        grant_type: "password",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });
    const { access_token, refresh_token } = response.data;
    // Store tokens in local storage
    await AsyncStorage.setItem("access_token", access_token);
    await AsyncStorage.setItem("refresh_token", refresh_token);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } 
}

export const verifyToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      return false;
    }
    const response = await api.get("/api/users/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}