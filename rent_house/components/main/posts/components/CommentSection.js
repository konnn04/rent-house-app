import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button } from 'react-native-paper';
import { useUser } from '../../../../contexts/UserContext';
import { api } from '../../../../utils/Fetch';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';

export const CommentSection = ({ postId, inModal = false, colors }) => {
  const { userData } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/comments/post_comments/?post_id=${postId}`);
      
      setComments(response.data.results || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Không thể tải bình luận. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId]);
  
  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchComments();
  };
  
  // Handle new comment submission
  const handleNewComment = (newComment) => {
    if (newComment.parent) {
      // If it's a reply, find the parent comment and update its replies
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === newComment.parent 
            ? { ...comment, reply_count: (comment.reply_count || 0) + 1 } 
            : comment
        )
      );
    } else {
      // If it's a top-level comment, add it to the list
      setComments(prevComments => [newComment, ...prevComments]);
    }
    
    // Clear reply state if it was a reply
    if (replyingTo) {
      setReplyingTo(null);
    }
  };
  
  // Handle reply
  const handleReply = (comment) => {
    setReplyingTo(comment);
  };
  
  // Cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };
  
  // Error retry
  const handleRetry = () => {
    fetchComments();
  };
  
  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
          Đang tải bình luận...
        </Text>
      </View>
    );
  }
  
  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={handleRetry}
          style={{ backgroundColor: colors.accentColor }}
        >
          Thử lại
        </Button>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={inModal ? 90 : 110}
    >
      <FlatList
        data={comments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <CommentItem 
            comment={item} 
            postId={postId}
            onReply={handleReply}
            colors={colors}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.commentsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Text>
          </View>
        }
        style={styles.list}
      />
      
      <CommentInput 
        postId={postId} 
        onCommentAdded={handleNewComment}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        colors={colors}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  commentsList: {
    padding: 10,
    paddingBottom: 80, // Space for input
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
