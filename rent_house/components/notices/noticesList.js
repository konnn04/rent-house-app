import react from 'react';
import { View, Text, Touchable } from 'react-native';  
import { useTheme } from '../../../contexts/ThemeContext';

const Notices = ({notice}) => {
    const { colors } = useTheme();
    return (
        <View style={styles.container}>
            <Text style =  {[styles.title]}>Thông báo</Text>
        </View>
    );
}

export default Notices;

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