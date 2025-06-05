import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Menu, PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../../../../contexts/UserContext';
import { getPostCommentsService } from '../../../../services/postService';
import { timeAgo } from '../../../../utils/Tools';
import { ImageGallery } from '../../../common/ImageGallery';

export const CommentItem = ({ comment, onReply, colors, postId, onDelete }) => {
  const { userData } = useUser();
  const navigation = useNavigation();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchReplies = useCallback(async (pageNum = 1, append = false) => {
    if (!comment.id || !postId) return;

    try {
      setLoadingReplies(true);
      const data = await getPostCommentsService(postId, comment.id, pageNum);
      if (data.results) {
        if (append) {
          setReplies(prev => [...prev, ...data.results]);
        } else {
          setReplies(data.results);
        }

        setHasMoreReplies(!!data.next);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.id, postId]);

  const toggleReplies = () => {
    const newState = !showReplies;
    setShowReplies(newState);

    if (newState && replies.length === 0) {
      fetchReplies();
    }
  };

  const loadMoreReplies = () => {
    if (hasMoreReplies && !loadingReplies) {
      fetchReplies(page + 1, true);
    }
  };

  useEffect(() => {
    if (showReplies && comment.reply_count > replies.length) {
      fetchReplies();
    }
  }, [comment.reply_count, showReplies]);

  const handleReplyPress = () => {
    if (onReply) {
      onReply(comment);
    }
  };

  const isCurrentUser = userData?.id === comment.author.id;

  return (
    <PaperProvider>
      <View style={styles.commentContainer}>
        <View style={styles.commentContent}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PublicProfile', { username: comment.author.username })}
          >
            <Image
              source={{ uri: comment.author.avatar_thumbnail || comment.author.avatar }}
              style={styles.avatar}
              defaultSource={require('@assets/images/default-avatar.png')}
            />
          </TouchableOpacity>

          <View style={styles.commentBody}>
            <View style={[styles.commentBubble, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.authorName, { color: colors.accentColor }]}>
                {comment.author.full_name}
              </Text>

              <Text style={[styles.commentText, { color: colors.textPrimary }]}>
                {comment.content}
              </Text>

              {comment.media && comment.media.length > 0 && (
                <View style={styles.mediaContainer}>
                  <ImageGallery mediaItems={comment.media} containerWidth={250} />
                </View>
              )}
            </View>

            <View style={styles.commentActions}>
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {timeAgo(comment.created_at)}
              </Text>

              <TouchableOpacity onPress={handleReplyPress} style={styles.replyButton}>
                <Text style={[styles.replyButtonText, { color: colors.textSecondary }]}>
                  Trả lời
                </Text>
              </TouchableOpacity>
              <View
                style={styles.moreButton_container}>
                {isCurrentUser && (
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreButton}>
                        <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    }
                    contentStyle={[styles.menuContent, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <Menu.Item
                      comment={comment}
                      onDelete={() => setMenuVisible(false)}
                      onPress={() => {
                        setMenuVisible(false);
                        Alert.alert(
                          'Xác nhận',
                          'Bạn có chắc muốn xóa bình luận này?',
                          [
                            { text: 'Hủy', style: 'cancel' },
                            { text: 'Xóa', style: 'destructive', onPress: () => onDelete(comment.id) },
                          ]
                        );
                      }}
                      title="Xóa bình luận"
                      titleStyle={{ color: colors.dangerColor }}
                      leadingIcon="delete"
                      leadingIconColor={colors.dangerColor}
                    />
                  </Menu>
                )}
              </View>
            </View>
          </View>
        </View>

        {comment.reply_count > 0 && (
          <TouchableOpacity
            style={styles.viewRepliesButton}
            onPress={toggleReplies}
          >
            <Text style={[styles.viewRepliesText, { color: colors.accentColor }]}>
              {showReplies
                ? 'Ẩn phản hồi'
                : `Xem ${comment.reply_count} phản hồi`}
            </Text>
            <Ionicons
              name={showReplies ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.accentColor}
            />
          </TouchableOpacity>
        )}

        {showReplies && (
          <View style={styles.repliesContainer}>
            {replies.map(reply => (
              <View key={reply.id} style={styles.replyContent}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PublicProfile', { username: reply.author.username })}
                >
                  <Image
                  source={{ uri: reply.author.avatar_thumbnail || reply.author.avatar }}
                  style={styles.replyAvatar}
                  defaultSource={require('@assets/images/default-avatar.png')}
                />
                </TouchableOpacity>

                <View style={styles.replyBody}>
                  <View style={[styles.commentBubble, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[styles.authorName, { color: colors.accentColor }]}>
                      {reply.author.full_name}
                    </Text>

                    <Text style={[styles.commentText, { color: colors.textPrimary }]}>
                      {reply.content}
                    </Text>

                    {reply.media && reply.media.length > 0 && (
                      <View style={styles.mediaContainer}>
                        <ImageGallery mediaItems={reply.media} containerWidth={220} />
                      </View>
                    )}
                  </View>

                  <View style={styles.commentActions}>
                    <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                      {timeAgo(reply.created_at)}
                    </Text>

                    <TouchableOpacity
                      onPress={() => onReply(reply)}
                      style={styles.replyButton}
                    >
                      <Text style={[styles.replyButtonText, { color: colors.textSecondary }]}>
                        Trả lời
                      </Text>
                    </TouchableOpacity>

                    {userData?.id === reply.author.id && (
                      <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {loadingReplies && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accentColor} />
              </View>
            )}

            {hasMoreReplies && !loadingReplies && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreReplies}
              >
                <Text style={{ color: colors.accentColor }}>Tải thêm phản hồi</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginBottom: 15,
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentBody: {
    flex: 1,
  },
  commentBubble: {
    padding: 10,
    borderRadius: 12,
  },
  authorName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediaContainer: {
    marginTop: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 10,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 15,
  },
  replyButton: {
    marginRight: 15,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    padding: 2,
  },
  moreButton_container: {
    zIndex: 999,
  },
  menuContent: {
    padding: 0,
    position: 'relative',
    top: -170,
    right: -16,
    borderWidth: 1,
    zIndex: 1000,
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 46,
    marginTop: 5,
    padding: 5,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 5,
  },
  repliesContainer: {
    marginLeft: 25,
    marginTop: 5,
  },
  replyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  replyBody: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
