import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 50,
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
    margin: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export const authStyles = (colors) => {
  return StyleSheet.create({
    authContainer: {
      flex: 1,
      padding: 0,
      backgroundColor: colors.backgroundPrimary, // Sử dụng màu nền từ theme
    },
    authTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
      color: colors.textPrimary, // Sử dụng màu textPrimary từ theme
    },
    authSubtitle: {
      fontSize: 16,
      margin: 15,
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
    errorText: {
      color: 'red',
      marginTop: 10,
    },
  });
}

export const homeStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 16,
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsList: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

});