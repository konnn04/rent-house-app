import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity , TextInput} from 'react-native';
import { styles } from '../../../styles/style';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

const HomeScreen = () => {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={homeStyles.headerContainer}>
        <View style={homeStyles.headerTop}>
          <Text style={[homeStyles.title, { color: colors.textPrimary }]}>
            RENT HOUSE
          </Text>
          <TouchableOpacity onPress={toggleTheme} style={homeStyles.themeButton}>
            <Ionicons 
              name={theme === 'dark' ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>
        <Text style={[homeStyles.greeting, { color: colors.textPrimary }]}>
          Xin chào
        </Text>
        <View style={[homeStyles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[homeStyles.searchInput, { color: colors.textPrimary }]}
            placeholder="Bạn tìm nhà sao ?"
            placeholderTextColor={colors.textSecondary}
            // value=""
            // onChangeText={() => {}}
          />
        </View>
      </View> 
    </View>
  );
};

const homeStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 35,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  }
});

export default HomeScreen;