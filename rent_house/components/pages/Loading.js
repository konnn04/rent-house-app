import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles } from '../../styles/style';

export default function Loading() {
  const navigation = useNavigation();

  useEffect(() => {
    checkInternetConnection();
  }, []);

  const checkInternetConnection = async () => {
    try {
      const response = await fetch('https://www.google.com');
      if (response.status === 200) {
        navigation.navigate('auth');
      }
    } catch (error) {
      alert('No internet connection');
    }
  };

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2f95dc" />
      <Text>Checking connection...</Text>
    </View>
  );
}