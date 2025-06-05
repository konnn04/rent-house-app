import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '../../styles/style';

import { checkStatusFromServer } from '../../services/Api';
import { PaperDialog } from '../common/PaperDialog';

export const Loading = () => {
  const navigation = useNavigation();
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [dialogContent, setDialogContent] = React.useState({ title: '', message: '', actions: [] });

  useEffect(() => {
    let timer = null;
    
    const checkConnection = async () => {
      const connected = await checkStatusFromServer();
      console.log('Connection status:', connected);
      setIsConnected && setIsConnected(connected);
      
      if (!connected) {
        setDialogContent({
          title: 'No Connection',
          message: 'Cannot connect to server. Will try again automatically.',
          actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
        });
        setDialogVisible(true);
        
        timer = setTimeout(() => {
          checkConnection();
        }, 30000); 
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
      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        message={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
      />
    </View>
  );
}