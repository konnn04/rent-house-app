import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUser } from '../../../contexts/UserContext';

export const NewPostSample = () => {
    const { colors } = useTheme();
    const { userData } = useUser();
    const navigation = useNavigation();
    
    // Xử lý khi người dùng nhấn vào component để tạo bài đăng mới
    const handlePress = () => {
        navigation.navigate('CreatePost')
    };
    
    // Hiển thị tên người dùng hoặc mặc định
    const displayName = userData?.first_name 
        ? `${userData.first_name} ${userData.last_name || ''}`
        : 'Bạn';
    
    return (
        <TouchableOpacity 
            style={[styles.createPostContainer, { backgroundColor: colors.backgroundSecondary }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.headerRow}>
                {/* Avatar người dùng */}
                {userData?.avatar ? (
                    <Image 
                        source={{ uri: userData.avatar }} 
                        style={styles.avatar} 
                    />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.accentColor }]}>
                        <Text style={styles.avatarText}>
                            {displayName.charAt(0)}
                        </Text>
                    </View>
                )}
                
                {/* Vùng nhập bài đăng */}
                <View style={[styles.inputField, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={{ color: colors.textSecondary }}>
                        {`${displayName} ơi, bạn đang nghĩ gì?`}
                    </Text>
                </View>
            </View>
            
            <View style={[styles.actionsContainer, { borderTopColor: colors.borderColor }]}>
                <ActionButton icon="image" color="#f44336" text="Hỗ trợ ảnh" textColor={colors.textSecondary} />
                <ActionButton icon="video-camera" color="#4CAF50" text="Hỗ trợ video" textColor={colors.textSecondary} />
                <ActionButton icon="map-marker" color="#2196F3" text="Hỗ trợ vị trí" textColor={colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );
};

const ActionButton = ({ icon, color, text, textColor }) => (
    <View style={styles.actionButton}>
        <FontAwesome name={icon} size={20} color={color} style={styles.actionIcon} />
        <Text style={{ color: textColor }}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    createPostContainer: {
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 15,
        marginBottom: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputField: {
        flex: 1,
        borderRadius: 20,
        padding: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        borderTopWidth: 0.5,
        paddingTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        marginRight: 5,
    },
});