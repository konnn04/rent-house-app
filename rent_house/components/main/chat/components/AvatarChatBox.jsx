import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
/**
 * Component hiển thị avatar của các thành viên trong một cuộc trò chuyện.
 * @param {Array} avatars - Mảng ảnh
 * @param {Number} size - Kích thước avatar
 * @param {String} borderColor - Màu viền
 */
export const AvatarChatBox = ({
    avatars = [],
    size = 50,
    borderColor = '#fff',
    style = {}
}) => {
    const { colors } = useTheme();
    const [loadError, setLoadError] = useState({});

    const containerSize = size;
    const isGroup = avatars.length > 1;
    const smallAvatarSize = isGroup ? size * 0.65 : size;
    const borderWidth = Math.max(1, size * 0.04);
    
    // Xử lý màu viền
    if (avatars.length === 0 || avatars.length === 1) {
        const avatarUrl = avatars.length === 0 ? null : avatars[0];
        return (
            <View
                style={[
                    styles.singleAvatarContainer,
                    {
                        width: containerSize,
                        height: containerSize,
                        borderRadius: containerSize / 2,
                        borderWidth: borderWidth,
                        borderColor: borderColor
                    }, style
                ]}
            >
                {!avatarUrl || loadError[0] ? (
                    <View style={[
                        styles.avatarFallback,
                        {
                            width: smallAvatarSize,
                            height: smallAvatarSize,
                            borderRadius: smallAvatarSize / 2,
                            backgroundColor: colors.accentColor
                        }
                    ]}>
                        <Text style={styles.avatarFallbackText}>
                            {'?'}
                        </Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: avatarUrl }}
                        style={{ width: smallAvatarSize, height: smallAvatarSize, borderRadius: smallAvatarSize / 2 }}
                        onError={() => setLoadError(prev => ({ ...prev, 0: true }))}
                        defaultSource={require('@assets/images/default-avatar.png')}
                    />
                )}
            </View>
        );
    }

    // Xử lý trường hợp có nhiều avatar
    const limitedAvatars = avatars.slice(0, 4);
    const avatarCount = limitedAvatars.length;

    return (
        <View
            style={[
                styles.groupAvatarContainer,
                {
                    width: containerSize,
                    height: containerSize,
                    borderRadius: containerSize / 2,
                    borderWidth: borderWidth,
                    borderColor: borderColor
                }, style
            ]}
        >
            {avatarCount === 2 && (
                <>
                    <View style={[styles.topLeftAvatar, styles.halfAvatar]}>
                        {renderAvatar(limitedAvatars[0], 0, smallAvatarSize, loadError, setLoadError, colors)}
                    </View>
                    <View style={[styles.bottomRightAvatar, styles.halfAvatar]}>
                        {renderAvatar(limitedAvatars[1], 1, smallAvatarSize, loadError, setLoadError, colors)}
                    </View>
                </>
            )}

            {avatarCount === 3 && (
                <>
                    <View style={[styles.topCenterAvatar, styles.thirdAvatar]}>
                        {renderAvatar(limitedAvatars[0], 0, smallAvatarSize * 0.85, loadError, setLoadError, colors)}
                    </View>
                    <View style={[styles.bottomLeftAvatar, styles.thirdAvatar]}>
                        {renderAvatar(limitedAvatars[1], 1, smallAvatarSize * 0.85, loadError, setLoadError, colors)}
                    </View>
                    <View style={[styles.bottomRightAvatar, styles.thirdAvatar]}>
                        {renderAvatar(limitedAvatars[2], 2, smallAvatarSize * 0.85, loadError, setLoadError, colors)}
                    </View>
                </>
            )}

            {avatarCount === 4 && (
                <>
                    <View style={[styles.topLeftAvatar, styles.quarterAvatar]}>
                        {renderAvatar(limitedAvatars[0], 0, smallAvatarSize * 0.65, loadError, setLoadError, colors)}
                    </View>
                    <View style={[styles.topRightAvatar, styles.quarterAvatar]}>
                        {renderAvatar(limitedAvatars[1], 1, smallAvatarSize * 0.65, loadError, setLoadError, colors)}
                    </View>
                    <View style={[styles.bottomLeftAvatar, styles.quarterAvatar]}>
                        {renderAvatar(limitedAvatars[2], 2, smallAvatarSize * 0.65, loadError, setLoadError, colors)}
                    </View>
                    <View style={[styles.bottomRightAvatar, styles.quarterAvatar]}>
                        {renderAvatar(limitedAvatars[3], 3, smallAvatarSize * 0.65, loadError, setLoadError, colors)}
                    </View>
                </>
            )}
        </View>
    );
};

// Hàm để render avatar
// Nếu có lỗi tải ảnh, hiển thị một hình vuông với dấu hỏi
const renderAvatar = (avatarUrl, index, size, loadError, setLoadError, colors) => {
    if (!avatarUrl) return null;

    if (loadError[index]) {
        return (
            <View style={[
                styles.avatarFallback,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colors.accentColor
                }
            ]}>
                <Text style={styles.avatarFallbackText}>
                    {'?'}
                </Text>
            </View>
        );
    }

    return (
        <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            onError={() => setLoadError(prev => ({ ...prev, [index]: true }))}
            defaultSource={require('@assets/images/default-avatar.png')}
        />
    );
};

const styles = StyleSheet.create({
    singleAvatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    groupAvatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        padding: 2,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarFallbackText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    centerAvatar: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    halfAvatar: {
        position: 'absolute',
        width: '65%',
        height: '65%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topLeftAvatar: {
        top: 0,
        left: 0,
    },
    bottomRightAvatar: {
        bottom: 5,
        right: 5,
    },
    thirdAvatar: {
        position: 'absolute',
        width: '33%',
        height: '33%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topCenterAvatar: {
        top: 5,
        alignSelf: 'center',
    },
    bottomLeftAvatar: {
        bottom: 5,
        left: 5,
    },
    quarterAvatar: {
        position: 'absolute',
        width: '50%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topRightAvatar: {
        top: 5,
        right: 0,
    },
});
