import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { api } from '../../../../utils/Fetch';

// Import rating components
import { AddRatingModal } from '../rating/AddRatingModal';
import { RateFilterOptions } from '../rating/RateFilterOptions';
import { RatingsList } from '../rating/RatingsList';

export const RatingsSection = ({ houseId, avgRating = 0, insideScrollView = false }) => {
  const { colors } = useTheme();
  const { userData } = useUser();
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(0); // 0 = all, 1-5 = star filter
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [userRating, setUserRating] = useState(null);
  
  // Fetch ratings
  const fetchRatings = useCallback(async (minStar = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `/api/rates/?house_id=${houseId}${minStar > 0 ? `&min_star=${minStar}` : ''}`;
      const response = await api.get(url);
      
      setRatings(response.data.results || []);
      
      // Check if user has already rated
      if (userData) {
        const userRating = response.data.results.find(
          rating => rating.user.id === userData.id
        );
        
        if (userRating) {
          setUserHasRated(true);
          setUserRating(userRating);
        } else {
          setUserHasRated(false);
          setUserRating(null);
        }
      }
      
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [houseId, userData]);
  
  useEffect(() => {
    fetchRatings(filter);
  }, [fetchRatings, filter]);
  
  // Apply filter
  const handleFilterChange = (value) => {
    setFilter(value);
  };
  
  // Handle add rating
  const handleAddRating = async (data) => {
    try {
      const formData = new FormData();
      formData.append('house', houseId);
      formData.append('star', data.rating);
      formData.append('comment', data.comment);
      
      // Add images if any
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
          });
        });
      }
      
      await api.post('/api/rates/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh ratings
      fetchRatings(filter);
      setAddModalVisible(false);
      
    } catch (error) {
      console.error('Error adding rating:', error);
      Alert.alert('Lỗi', 'Không thể thêm đánh giá. Vui lòng thử lại sau.');
    }
  };
  
  // Handle edit rating
  const handleEditRating = () => {
    setAddModalVisible(true);
  };
  
  // Render rating summary
  const renderRatingSummary = () => (
    <View style={[styles.summaryContainer, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.ratingValueContainer}>
        <Text style={[styles.ratingValue, { color: colors.textPrimary }]}>
          {avgRating ? avgRating.toFixed(1) : '--'}
        </Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={star <= Math.round(avgRating) ? 'star' : 'star-outline'}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
        <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>
          {ratings.length} đánh giá
        </Text>
      </View>
      
      {userData && !userHasRated && (
        <Button
          mode="contained"
          onPress={() => setAddModalVisible(true)}
          style={[styles.addRatingButton, { backgroundColor: colors.accentColor }]}
        >
          Đánh giá
        </Button>
      )}
      
      {userHasRated && (
        <Button
          mode="outlined"
          onPress={handleEditRating}
          style={[styles.editRatingButton, { borderColor: colors.accentColor }]}
          labelStyle={{ color: colors.accentColor }}
        >
          Sửa đánh giá
        </Button>
      )}
    </View>
  );
  
  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentColor} />
        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
          Đang tải đánh giá...
        </Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => fetchRatings(filter)}
          style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
        >
          Thử lại
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Rating summary */}
      {renderRatingSummary()}
      
      {/* Filter options */}
      <RateFilterOptions
        selectedFilter={filter}
        onFilterChange={handleFilterChange}
      />
      
      <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      
      {/* Ratings list - use useScrollView=true when inside another ScrollView */}
      <RatingsList ratings={ratings} useScrollView={insideScrollView} />
      
      {/* Add/Edit rating modal */}
      <AddRatingModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddRating}
        initialData={userRating}
        isEdit={userHasRated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  ratingValueContainer: {
    alignItems: 'flex-start',
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  ratingCount: {
    fontSize: 14,
  },
  addRatingButton: {
    borderRadius: 8,
  },
  editRatingButton: {
    borderRadius: 8,
  },
  divider: {
    marginVertical: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    borderRadius: 8,
  },
});
