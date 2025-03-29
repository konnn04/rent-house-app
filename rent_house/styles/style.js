import { StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2f95dc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export const authStyles = (colors) => {
  return  StyleSheet.create({
    authContainer: {
      flex: 2,
      padding: 0,
      justifyContent: "space-around",
      backgroundColor: colors.backgroundPrimary, // Sử dụng màu nền từ theme
    },
    authTitle: {
      fontSize: 60,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
      color: colors.textPrimary, // Sử dụng màu textPrimary từ theme
    },
    authSubtitle: {
      fontSize: 16,
      marginBottom: 30,
      textAlign: "center",
      color: colors.textSecondary, // Sử dụng màu textSecondary từ theme
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: colors.borderColor, // Sử dụng màu borderColor từ theme
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      backgroundColor: colors.backgroundSecondary, // Sử dụng màu backgroundSecondary từ theme
      color: colors.textPrimary, // Sử dụng màu textPrimary từ theme
    },
    button: {
      backgroundColor: colors.accentColor, // Sử dụng màu accentColor từ theme
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
    },
    buttonText: {
      color: colors.textPrimary, // Sử dụng màu textPrimary từ theme
      fontSize: 16,
      fontWeight: "bold",
    },
  });
}

