import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import {
  createHouseRatingService,
  getHouseRatingsService
} from '../../../../services/houseService';
import { PaperDialog } from '../../../common/PaperDialog';

import { AddRatingModal } from '../rating/AddRatingModal';
import { RateFilterOptions } from '../rating/RateFilterOptions';
import { RatingsList } from '../rating/RatingsList';

export const RatingsSection = ({ houseId, avgRating = 0, insideScrollView = false }) => {
  const { colors } = useTheme();
  const { userData } = useUser();
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(0); // 0 = all, 1-5 = 
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });
  
  const fetchRatings = useCallback(async (minStar = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHouseRatingsService(houseId, null, minStar);
      setRatings(data.results || []);

      if (userData) {
        const userRating = data.results.find(
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
  
  const handleFilterChange = (value) => {
    setFilter(value);
  };
  
  const handleAddRating = async (data) => {
    try {
      const formData = new FormData();
      formData.append('house', houseId);
      formData.append('star', data.rating);
      formData.append('comment', data.comment);
      
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
          });
        });
      }
      
      await createHouseRatingService(formData);
      setDialogContent({
        title: 'Thành công',
        message: 'Đánh giá của bạn đã được thêm thành công.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
      
      fetchRatings(filter);
      setAddModalVisible(false);
      
    } catch (error) {
      console.error('Error adding rating:', error);
      setDialogContent({
        title: 'Lỗi',
        message: 'Không thể thêm đánh giá. Vui lòng thử lại sau.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    }
  };
  
  const handleEditRating = () => {
    setAddModalVisible(true);
  };
  
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
      {renderRatingSummary()}
      
      <RateFilterOptions
        selectedFilter={filter}
        onFilterChange={handleFilterChange}
      />
      
      <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      
      <RatingsList ratings={ratings} useScrollView={insideScrollView} />
      
      <AddRatingModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddRating}
        initialData={userRating}
        isEdit={userHasRated}
      />
      
      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        message={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginTop: 10,
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
