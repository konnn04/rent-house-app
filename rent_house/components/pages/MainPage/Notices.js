import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { api } from '../../../utils/Apis';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '@react-navigation/elements';
import { getTimeAgo } from '../../../utils/Tools';

const Notices = () => {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false); // State cho tải thêm
    const [nextPageUrl, setNextPageUrl] = useState(null); // URL trang tiếp theo
    const [menuVisible, setMenuVisible] = useState(false);

    const noticeTypeIcon = {
        'comment': 'comment',
        'new_post': 'post',
        'follow': 'clover',
        'interaction': 'bell',
        'message': 'message-badge',
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async (url = '/api/notifications/', append = false) => {
        try {
            const response = await api.get(url);
            if (response.status !== 200) {
                throw new Error('Failed to fetch notifications');
            }
            const { results, next } = response.data;
            setNotifications((prev) => (append ? [...prev, ...results] : results));
            setNextPageUrl(next);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const loadMoreNotifications = () => {
        if (loadingMore || !nextPageUrl) return;
        setLoadingMore(true);
        fetchNotifications(nextPageUrl, true);
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/api/notifications/mark_all_as_read/');
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, is_read: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const renderNotification = ({ item }) => {
        const iconName = noticeTypeIcon[item.type] || 'bell';
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.notificationContainer}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.sender.avatar_thumbnail }} style={styles.avatar} />
                        <Icon
                            name={iconName}
                            size={24}
                            color={colors.textPrimary}
                            style={[styles.iconOverlay, { backgroundColor: colors.infoColor }]}
                        />
                    </View>
                    <View style={styles.notificationContent}>
                        <Text style={[styles.senderName, { color: colors.textPrimary }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.sender.full_name}
                        </Text>
                        <Text
                            style={[styles.notificationText, { color: colors.textPrimary }]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            height={32}
                        >
                            {item.content}
                        </Text>
                        <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                            {getTimeAgo(item.created_at)}
                        </Text>
                    </View>
                    <Button style={styles.notificationBtn}>
                        <Text style={{ fontSize: 20 }}>⋮</Text>
                    </Button>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.accentColor} />
                <Text style={{ color: colors.textSecondary, marginLeft: 10 }}>Đang tải...</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông báo</Text>
            </View>

            {/* Notifications List */}
            {loading ? (
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Đang tải...
                </Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderNotification}
                    contentContainerStyle={{ paddingBottom: 50}}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.accentColor]}
                            tintColor={colors.accentColor}
                        />
                    }
                    onEndReached={loadMoreNotifications}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            )}
        </View>
    );
};

export default Notices;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerMenu: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    menu: {
        position: 'absolute',
        top: 50,
        right: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    notificationContainer: {
        flexDirection: 'row',
        padding: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    notificationContent: {
        flex: 1,

    },
    senderName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationText: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '600',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    iconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 8,
        padding: 5,
        margin: 5,
        borderRadius: 50,
    },
    notificationTime: {
        fontSize: 12,
        marginTop: 4,
    },
    notificationBtn: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'null',
        borderRadius: 8,
        padding: 20,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
});