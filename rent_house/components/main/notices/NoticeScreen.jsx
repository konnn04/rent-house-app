import { useIsFocused } from '@react-navigation/native';
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
import { useNotificationCount } from '../../../contexts/NotificationCountContext';
import { useTheme } from '../../../contexts/ThemeContext';
import {
    deleteNotificationService,
    getNotificationsService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService
} from '../../../services/notificationService';

import { NotificationCard } from "./NotificationCard";

export const NoticeScreen = () => {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { resetNotificationCount, fetchUnreadNotifications } = useNotificationCount();
    const isFocused = useIsFocused();
    
    // Fetch notifications - tối ưu để tránh gọi API liên tục
    const fetchNotifications = useCallback(async (isRefresh = false) => {
        // Nếu đang tải, bỏ qua request mới
        if ((loading && !isRefresh) || (loadingMore && !isRefresh) || (refreshing && !isRefresh)) {
            return;
        }
        
        try {
            // Cập nhật trạng thái loading phù hợp
            if (isRefresh) {
                setRefreshing(true);
                setNextPageUrl(null);
                setPage(1);
            } else if (nextPageUrl) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            
            setHasError(false);
            
            // Gọi service với tham số phù hợp
            const response = await getNotificationsService(isRefresh ? null : nextPageUrl);
            
            if (response) {
                const { results, next } = response;
                
                if (results && Array.isArray(results)) {
                    setNotifications(prev => {
                        if (isRefresh) {
                            return results;
                        } else {
                            // Tránh trùng lặp khi thêm dữ liệu mới
                            const existingIds = new Set(prev.map(item => item.id));
                            const newItems = results.filter(item => !existingIds.has(item.id));
                            return [...prev, ...newItems];
                        }
                    });
                    
                    // Cập nhật trạng thái phân trang
                    setNextPageUrl(next);
                    setHasMore(!!next);
                    if (!isRefresh) {
                        setPage(page + 1);
                    }
                } else {
                    if (isRefresh) {
                        setNotifications([]);
                    }
                    setNextPageUrl(null);
                    setHasMore(false);
                }
            } else {
                throw new Error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (!isRefresh) {
                // Chỉ hiển thị lỗi khi refresh hoặc load ban đầu
                setHasError(true);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [loading, loadingMore, refreshing, nextPageUrl, page]);
    
    // Chỉ gọi API khi component mount
    useEffect(() => {
        fetchNotifications(true);
    }, []);
    
    // Reset notification count when screen is focused
    useEffect(() => {
        if (isFocused) {
            resetNotificationCount();
        }
    }, [isFocused, resetNotificationCount]);

    // Update count when the user refreshes
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setNextPageUrl(null);
        fetchNotifications(true);
        resetNotificationCount();
    }, [fetchNotifications, resetNotificationCount]);
    
    // Load more - chỉ gọi khi cần và có thêm dữ liệu
    const handleLoadMore = useCallback(() => {
        if (loadingMore || !hasMore || loading || refreshing) return;
        
        // Thêm debounce để tránh gọi nhiều lần liên tiếp
        if (nextPageUrl) {
            fetchNotifications(false);
        }
    }, [loadingMore, hasMore, nextPageUrl, fetchNotifications, loading, refreshing]);

    // Mark notification as read
    const markAsRead = useCallback(async (notification) => {
        if (notification.is_read) return;

        try {
            await markNotificationAsReadService(notification.id);

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
        
        // Refresh notification count after marking as read
        fetchUnreadNotifications();

        // Thêm logic điều hướng tùy theo loại thông báo
        // Ví dụ: if (notification.type === 'comment') { navigation.navigate(...) }
    }, [markAsRead, fetchUnreadNotifications]);

    // Handle notification menu
    const handleMenuPress = useCallback((notification) => {
        setSelectedNotification(notification);
        setMenuVisible(true);
    }, []);

    // Mark all as read
    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllNotificationsAsReadService();
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
            await deleteNotificationService(selectedNotification.id);
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
                        <TouchableOpacity onPress={() => setMenuVisible(true)}
                            onDismiss={() => setMenuVisible(false)}
                        >
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
                    onEndReachedThreshold={0.3} // Giảm ngưỡng để tránh gọi quá sớm
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
