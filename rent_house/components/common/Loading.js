import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '../../styles/style';

import { Alert } from 'react-native';
import { checkInternetConnection } from '../../utils/Fetch';

export const Loading = () => {
  const navigation = useNavigation();

  useEffect(() => {
    let timer = null;
    
    const checkConnection = async () => {
      const connected = await checkInternetConnection();
      console.log('Connection status:', connected);
      setIsConnected(connected);
      
      if (!connected) {
        Alert.alert(
          "No Connection",
          "Cannot connect to server. Will try again automatically."
        );
        
        timer = setTimeout(() => {
          checkConnection();
        }, 30000); // 30 seconds delay
      } else {
        navigation.navigate('main');
      }
    };
    
    checkConnection();
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2f95dc" />
      <Text>Checking connection...</Text>
    </View>
  );
}