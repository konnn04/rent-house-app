import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../../../../contexts/UserContext';
import { api } from '../../../../utils/Fetch';
import { timeAgo } from '../../../../utils/Tools';
import { ImageGallery } from '../../../common/ImageGallery';

export const CommentItem = ({ comment, onReply, colors, postId }) => {
  const { userData } = useUser();
  
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  
  // Fetch replies for this comment
  const fetchReplies = useCallback(async (pageNum = 1, append = false) => {
    if (!comment.id || !postId) return;
    
    try {
      setLoadingReplies(true);
      
      const response = await api.get(
        `/api/comments/post_comments/?post_id=${postId}&parent_id=${comment.id}&page=${pageNum}`
      );
      
      if (response.data.results) {
        if (append) {
          setReplies(prev => [...prev, ...response.data.results]);
        } else {
          setReplies(response.data.results);
        }
        
        setHasMoreReplies(!!response.data.next);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.id, postId]);
  
  // Toggle showing replies
  const toggleReplies = () => {
    const newState = !showReplies;
    setShowReplies(newState);
    
    if (newState && replies.length === 0) {
      fetchReplies();
    }
  };
  
  // Load more replies
  const loadMoreReplies = () => {
    if (hasMoreReplies && !loadingReplies) {
      fetchReplies(page + 1, true);
    }
  };
  
  // Reload replies if the reply count changes
  useEffect(() => {
    if (showReplies && comment.reply_count > replies.length) {
      fetchReplies();
    }
  }, [comment.reply_count, showReplies]);
  
  // Handle the reply button press
  const handleReplyPress = () => {
    if (onReply) {
      onReply(comment);
    }
  };
  
  // Check if the comment is from the current user
  const isCurrentUser = userData?.id === comment.author.id;
  
  return (
    <View style={styles.commentContainer}>
      {/* Main comment */}
      <View style={styles.commentContent}>
        <Image 
          source={{ uri: comment.author.avatar_thumbnail || comment.author.avatar }} 
          style={styles.avatar} 
          defaultSource={require('@assets/images/default-avatar.png')}
        />
        
        <View style={styles.commentBody}>
          <View style={[styles.commentBubble, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.authorName, { color: colors.accentColor }]}>
              {comment.author.full_name}
            </Text>
            
            <Text style={[styles.commentText, { color: colors.textPrimary }]}>
              {comment.content}
            </Text>
            
            {/* Show images if any */}
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
            
            {isCurrentUser && (
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      {/* Replies section */}
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
      
      {/* Show replies if expanded */}
      {showReplies && (
        <View style={styles.repliesContainer}>
          {replies.map(reply => (
            <View key={reply.id} style={styles.replyContent}>
              <Image 
                source={{ uri: reply.author.avatar_thumbnail || reply.author.avatar }} 
                style={styles.replyAvatar} 
                defaultSource={require('@assets/images/default-avatar.png')}
              />
              
              <View style={styles.replyBody}>
                <View style={[styles.commentBubble, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.authorName, { color: colors.accentColor }]}>
                    {reply.author.full_name}
                  </Text>
                  
                  <Text style={[styles.commentText, { color: colors.textPrimary }]}>
                    {reply.content}
                  </Text>
                  
                  {/* Show images if any */}
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
          
          {/* Loading indicator for more replies */}
          {loadingReplies && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.accentColor} />
            </View>
          )}
          
          {/* Load more replies button */}
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
