import { StyleSheet } from 'react-native';
import color from '../constants/Colors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.dark.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: color.dark.text,
    },
    subtitle: {
        fontSize: 18,
        color: color.dark.text,
        textAlign: 'center',
    },
});

export default styles;