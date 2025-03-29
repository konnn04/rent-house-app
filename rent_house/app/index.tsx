import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from '../styles/style';

export default function Home() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to Rent House</Text>
                <Text style={styles.subtitle}>
                    Find your perfect home with our rental platform
                </Text>
            </View>
        </SafeAreaView>
    );
}


