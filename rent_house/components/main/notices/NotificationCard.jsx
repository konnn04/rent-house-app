import { memo } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { timeAgo } from '../../../utils/Tools';

const NOTIFICATION_TYPE_ICONS = {
    'comment': 'comment-text',
    'new_post': 'post',
    'follow': 'account-plus',
    'interaction': 'bell',
    'message': 'message-text',
    'system': 'information'
};

export const NotificationCard = memo(({ item, onPress, onMenuPress }) => {
    const iconName = NOTIFICATION_TYPE_ICONS[item.type] || 'bell';
    const isUnread = !item.is_read;
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            style={[
                styles.notificationContainer,
                { borderBottomColor: colors.borderColor || '#E0E0E0' },
                isUnread && {
                    backgroundColor: colors.infoColor + '43' || colors.accentColor + '10' 
                }
            ]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            {isUnread && (
                <View style={[
                    styles.unreadIndicator, 
                    { backgroundColor: colors.accentColor }
                ]} />
            )}
            
            <View style={styles.avatarContainer}>
                {item.sender.avatar_thumbnail ? (
                    <Image
                        source={{ uri: item.sender.avatar_thumbnail }}
                        style={styles.avatar}
                        defaultSource={require('@assets/images/default-avatar.png')}
                    />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.accentColor }]}>
                        <Text style={[styles.avatarText, { color: colors.textPrimary }]}>
                            {item.sender.full_name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                )}
                <Icon
                    name={iconName}
                    size={14}
                    color="#fff"
                    style={[styles.iconOverlay, { backgroundColor: colors.accentColor }]}
                />
            </View>

            <View style={styles.notificationContent}>
                <Text
                    style={[
                        styles.senderName,
                        { color: colors.textPrimary },
                        !item.is_read && { fontWeight: 'bold' }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.sender.full_name}
                </Text>
                <Text
                    style={[styles.notificationText, { color: colors.textPrimary }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {item.content}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textPrimary }]}>
                    {timeAgo(item.created_at)}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => onMenuPress(item)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
                <Icon name="dots-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.is_read === nextProps.item.is_read &&
        prevProps.item.content === nextProps.item.content
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 70,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 400,
    },
    notificationContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    avatarContainer: {
        aspectRatio: 1,
        width: 50,
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconOverlay: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        padding: 3,
        borderRadius: 50,
        borderWidth: 1.5,
        borderColor: 'white',
    },
    notificationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    senderName: {
        fontSize: 16,
        marginBottom: 2,
    },
    notificationText: {
        fontSize: 14,
        lineHeight: 18,
    },
    notificationTime: {
        fontSize: 12,
        marginTop: 4,
    },
    notificationBtn: {
        padding: 5,
        justifyContent: 'center',
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 15,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
