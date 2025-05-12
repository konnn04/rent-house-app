import react from 'react';
import { View, Text, Touchable } from 'react-native';  
import { useTheme } from '../../../contexts/ThemeContext';

const Notices = ({notice}) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity style={styles.container}>
            <Image source={{ uri: notice.avatar }} style={styles.avatar} />
            <View style={styles.NoticeInfo}>
                <Text style={[styles.NoticeName, {color: colors.textPrimary}]}>Renter 5</Text>
                <Text style={[styles.NoticeLastMessage, {color: colors.textSecondary}]}>đã bình luận về bài viết của bạn</Text>
            </View>
        </TouchableOpacity>
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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    noticeInfo: {
        flex: 1,
    },
    noticeName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    noticeLastMessage: {
        color: '#555',
        fontSize: 14,
    },
}