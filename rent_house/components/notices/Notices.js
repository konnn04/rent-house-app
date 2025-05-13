import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Divider, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../utils/Fetch';

import { NotificationCard } from "./NotificationCard";

export const Notices = () => {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Fetch notifications - Sửa lại URL ban đầu để đúng định dạng phân trang
    const fetchNotifications = useCallback(async (url = `/api/notifications?page=1`, append = false) => {
        try {
            if (!append) {
                setHasError(false);
            }

            // Kiểm tra nếu url là full URL (bắt đầu với http/https), lấy chỉ path
            let apiUrl = url;
            if (url.startsWith('http')) {
                const urlObj = new URL(url);
                apiUrl = urlObj.pathname + urlObj.search;
            }

            console.log('Fetching notifications from:', apiUrl); // Logging để debug

            const response = await api.get(apiUrl);
            if (response.status === 200) {
                const { results, next } = response.data;

                if (results && Array.isArray(results)) {
                    setNotifications(prev => {
                        if (append) {
                            // Loại bỏ các thông báo trùng lặp
                            const existingIds = new Set(prev.map(item => item.id));
                            const newItems = results.filter(item => !existingIds.has(item.id));
                            return [...prev, ...newItems];
                        }
                        return results;
                    });

                    // Xử lý nextPageUrl
                    setNextPageUrl(next);
                    console.log('Next page URL:', next); // Logging để debug
                } else {
                    if (!append) {
                        setNotifications([]);
                    }
                    setNextPageUrl(null);
                }
            } else {
                throw new Error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (error.response && error.response.status === 401) {
                console.error('Authentication error - token may have expired');
                // Có thể thêm logic refresh token ở đây nếu cần
            }
            if (!append) {
                setHasError(true);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Pull to refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    // Cải thiện handleLoadMore để xử lý URL tốt hơn
    const handleLoadMore = useCallback(() => {
        if (loadingMore || !nextPageUrl || loading || refreshing) return;

        console.log('Loading more with URL:', nextPageUrl);

        // Kiểm tra nextPageUrl có phải là URL hợp lệ không
        if (typeof nextPageUrl !== 'string' || nextPageUrl.trim() === '') {
            console.warn('Invalid nextPageUrl:', nextPageUrl);
            return;
        }

        // Thêm khoảng thời gian nhỏ trước khi tải thêm để tránh tải quá nhanh
        setTimeout(() => {
            setLoadingMore(true);
            fetchNotifications(nextPageUrl, true);
        }, 300);
    }, [loadingMore, nextPageUrl, fetchNotifications, loading, refreshing]);

    // Mark notification as read
    const markAsRead = useCallback(async (notification) => {
        if (notification.is_read) return;

        try {
            await api.patch(`/api/notifications/${notification.id}/mark_as_read/`);

            // Update local state
            setNotifications(prev =>
                prev.map(item =>
                    item.id === notification.id
                        ? { ...item, is_read: true }
                        : item
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    // Handle notification click
    const handleNotificationPress = useCallback((notification) => {
        markAsRead(notification);

        // Thêm logic điều hướng tùy theo loại thông báo
        // Ví dụ: if (notification.type === 'comment') { navigation.navigate(...) }
    }, [markAsRead]);

    // Handle notification menu
    const handleMenuPress = useCallback((notification) => {
        setSelectedNotification(notification);
        setMenuVisible(true);
    }, []);

    // Mark all as read
    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await api.post('/api/notifications/mark_all_as_read/');
            setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
            setMenuVisible(false);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, []);

    // Delete notification
    const handleDeleteNotification = useCallback(async () => {
        if (!selectedNotification) return;

        try {
            await api.delete(`/api/notifications/${selectedNotification.id}/`);
            setNotifications(prev => prev.filter(item => item.id !== selectedNotification.id));
            setMenuVisible(false);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [selectedNotification]);

    // Render error state
    const renderError = () => (
        <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
            <Text style={[styles.errorText, { color: colors.dangerColor }]}>
                Không thể tải thông báo
            </Text>
            <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
                onPress={() => {
                    setLoading(true);
                    fetchNotifications();
                }}
            >
                <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
        </View>
    );

    // Render empty state
    const renderEmpty = () => (
        <View style={styles.centerContainer}>
            <Icon name="bell-off-outline" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Chưa có thông báo nào
            </Text>
        </View>
    );

    // Render loading indicator
    const renderLoading = () => (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accentColor} />
            <Text style={{ marginTop: 10, color: colors.textSecondary }}>
                Đang tải thông báo...
            </Text>
        </View>
    );

    // Render loading footer
    const renderFooter = useCallback(() => {
        if (!loadingMore) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.accentColor} />
                <Text style={{ color: colors.textSecondary, marginLeft: 10 }}>
                    Đang tải thêm...
                </Text>
            </View>
        );
    }, [loadingMore, colors.accentColor, colors.textSecondary]);

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông báo</Text>

                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <TouchableOpacity onPress={() => setMenuVisible(true)}>
                            <Icon name="dots-horizontal" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    }
                    contentStyle={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Menu.Item
                        onPress={handleMarkAllAsRead}
                        title="Đánh dấu tất cả là đã đọc"
                        titleStyle={{ color: colors.textPrimary }}
                        leadingIcon="check-all"
                    />
                    {selectedNotification && (
                        <>
                            <Divider />
                            <Menu.Item
                                onPress={handleDeleteNotification}
                                title="Xóa thông báo này"
                                titleStyle={{ color: colors.dangerColor }}
                                leadingIcon="delete"
                            />
                        </>
                    )}
                </Menu>
            </View>

            {/* Content */}
            {loading ? (
                renderLoading()
            ) : hasError ? (
                renderError()
            ) : notifications.length === 0 ? (
                renderEmpty()
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <NotificationCard
                            item={item}
                            onPress={handleNotificationPress}
                            onMenuPress={handleMenuPress}
                            colors={colors}
                        />
                    )}
                    contentContainerStyle={{
                        paddingBottom: 50,
                        flexGrow: notifications.length === 0 ? 1 : undefined,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.accentColor]}
                            tintColor={colors.accentColor}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    // Tối ưu performance của FlatList
                    windowSize={3}
                    maxToRenderPerBatch={5}
                    updateCellsBatchingPeriod={100}
                    removeClippedSubviews={true}
                    initialNumToRender={7}
                />
            )}
        </View>
    );
};

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
        fontWeight: 'bold',
    },
    notificationContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
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
