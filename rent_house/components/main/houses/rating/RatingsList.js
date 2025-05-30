import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImageGallery } from '../../../../components/common/ImageGallery';
import { useTheme } from '../../../../contexts/ThemeContext';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Individual rating item component
const RatingItem = ({ rating }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.ratingItem}>
      {/* User info and rating */}
      <View style={styles.ratingHeader}>
        <Image 
          source={{ uri: rating.user?.avatar_thumbnail || 'https://via.placeholder.com/40' }} 
          style={styles.userAvatar} 
        />
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {rating.user?.full_name || 'Người dùng'}
          </Text>
          
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= rating.star ? 'star' : 'star-outline'}
                size={16}
                color="#FFD700"
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={[styles.ratingDate, { color: colors.textSecondary }]}>
              {formatDate(rating.created_at)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Rating comment */}
      <Text style={[styles.ratingComment, { color: colors.textPrimary }]}>
        {rating.comment}
      </Text>
      
      {/* Rating images if available */}
      {rating.images && rating.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <ImageGallery mediaItems={rating.images} />
        </View>
      )}
    </View>
  );
};

export const RatingsList = ({ ratings = [], useScrollView = false }) => {
  const { colors } = useTheme();
  
  if (ratings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="comment-text-outline" size={50} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Chưa có đánh giá nào
        </Text>
      </View>
    );
  }
  
  // Use View with mapped items instead of FlatList when useScrollView is true
  if (useScrollView) {
    return (
      <View style={styles.listContainer}>
        {ratings.map((item, index) => (
          <React.Fragment key={item.id.toString()}>
            <RatingItem rating={item} />
            {index < ratings.length - 1 && (
              <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  }
  
  // Otherwise use FlatList (for standalone screens)
  return (
    <FlatList
      data={ratings}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <RatingItem rating={item} />}
      ItemSeparatorComponent={() => (
        <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  ratingItem: {
    padding: 15,
  },
  ratingHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 3,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingDate: {
    fontSize: 12,
    marginLeft: 10,
  },
  ratingComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  imagesContainer: {
    marginTop: 10,
  },
  divider: {
    height: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});
