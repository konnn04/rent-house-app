import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { api } from '../../../../utils/Fetch';
import { RatingsList } from './RatingsList';

export const RatingsSection = ({ houseId, avgRating }) => {
  const { colors } = useTheme();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchRatings = useCallback(async () => {
    if (!houseId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/houses/${houseId}/ratings/`);
      setRatings(response.data.results || []);
      
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [houseId]);
  
  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);
  
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
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
        <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accentColor }]}
          onPress={fetchRatings}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Rating overview */}
      <View style={[styles.ratingOverview, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.ratingTitle, { color: colors.textPrimary }]}>Đánh giá tổng quan</Text>
        
        <View style={styles.ratingRow}>
          <Text style={[styles.ratingValue, { color: colors.textPrimary }]}>
            {avgRating ? avgRating.toFixed(1) : '0.0'}
          </Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= Math.round(avgRating || 0) ? 'star' : 'star-outline'}
                size={24}
                color="#FFD700"
                style={{ marginRight: 4 }}
              />
            ))}
            
            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
              ({ratings.length} đánh giá)
            </Text>
          </View>
        </View>
      </View>
      
      {/* Ratings list */}
      <RatingsList ratings={ratings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ratingOverview: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewCount: {
    marginLeft: 5,
  },
});
