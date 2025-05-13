import { Text, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

export const NoticesList = ({notice}) => {
    const { colors } = useTheme();
    return (
        <View style={styles.container}>
            <Text style =  {[styles.title]}>Thông báo</Text>
        </View>
    );
}

const styles = {   
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },  
    title : {
        fontSize: 20,
    },
}