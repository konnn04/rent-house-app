import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, RadioButton } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';

export const LanguageSettingsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  
  const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
  ];
  
  const handleLanguageChange = async (languageCode) => {
    setSelectedLanguage(languageCode);
    try {
      await AsyncStorage.setItem('appLanguage', languageCode);
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={[styles.header, { backgroundColor: colors.accentColorLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ngôn ngữ</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.content}>
          <RadioButton.Group onValueChange={handleLanguageChange} value={selectedLanguage}>
            {languages.map((language, index) => (
              <View key={language.code}>
                <TouchableOpacity 
                  style={styles.languageOption}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name={language.code === 'vi' ? 'flag' : 'flag-outline'} 
                      size={24} 
                      color={colors.accentColor} 
                      style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{language.name}</Text>
                  </View>
                  <RadioButton.Android 
                    value={language.code} 
                    color={colors.accentColor}
                    uncheckedColor={colors.textSecondary}
                  />
                </TouchableOpacity>
                {index < languages.length - 1 && (
                  <Divider style={{ backgroundColor: colors.borderColor }} />
                )}
              </View>
            ))}
          </RadioButton.Group>
          
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            * Thay đổi ngôn ngữ sẽ được áp dụng khi khởi động lại ứng dụng
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  note: {
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  }
});
