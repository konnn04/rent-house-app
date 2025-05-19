import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { Button, Card, Chip, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../contexts/ThemeContext';
import { api } from '../../../../utils/Fetch';
import { formatCurrency } from '../../../../utils/Tools';
import { ManageHeader } from './components/ManageHeader';

export const RoomDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { roomId } = route.params;
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/rooms/${roomId}/`);
      setRoom(response.data);
      
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);
  
  const handleEditRoom = () => {
    navigation.navigate('AddEditRoom', {
      houseId: room.house,
      houseTitle: room.house_title,
      roomId: room.id,
      isEditing: true
    });
  };
  
  const handleDeleteRoom = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa phòng "${room.title}" không?`,
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/rooms/${room.id}/`);
              Alert.alert('Thành công', 'Phòng đã được xóa');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Lỗi', 'Không thể xóa phòng. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ManageHeader
          title="Chi tiết phòng"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
            Đang tải thông tin phòng...
          </Text>
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ManageHeader
          title="Chi tiết phòng"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchRoomDetails}
            style={{ backgroundColor: colors.accentColor, marginTop: 10 }}
          >
            Thử lại
          </Button>
        </View>
      </View>
    );
  }
  
  if (!room) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ManageHeader
          title="Chi tiết phòng"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.dangerColor} />
          <Text style={[styles.errorText, { color: colors.dangerColor }]}>
            Không tìm thấy thông tin phòng
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: colors.accentColor, marginTop: 10 }}
          >
            Quay lại
          </Button>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ManageHeader
        title={room.title || `Phòng ${room.id}`}
        subtitle={`Thuộc ${room.house_title}`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          {room.media && room.media.length > 0 ? (
            <>
              <Image
                source={{ uri: room.media[activeImageIndex]?.url }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsContainer}>
                {room.media.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setActiveImageIndex(index)}
                    style={[
                      styles.thumbnailWrapper,
                      activeImageIndex === index && { borderColor: colors.accentColor, borderWidth: 2 }
                    ]}
                  >
                    <Image
                      source={{ uri: image.thumbnail }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <View style={[styles.noImageContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Icon name="image-off" size={60} color={colors.textSecondary} />
              <Text style={[styles.noImageText, { color: colors.textSecondary }]}>
                Không có hình ảnh
              </Text>
            </View>
          )}
        </View>
        
        {/* Basic Info Card */}
        <Card style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Thông tin cơ bản</Text>
            
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.accentColor }]}>
                {formatCurrency(room.price)} / tháng
              </Text>
              
              <Chip 
                icon={room.is_available ? "check" : "close"}
                style={{ 
                  backgroundColor: room.is_available ? colors.successLight : colors.dangerLight
                }}
              >
                <Text style={{ 
                  color: room.is_available ? colors.successColor : colors.dangerColor
                }}>
                  {room.is_available ? 'Còn trống' : 'Đã đầy'}
                </Text>
              </Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="ruler-square" size={20} color={colors.accentColor} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{room.area} m²</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Diện tích</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="bed" size={20} color={colors.accentColor} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{room.bedrooms}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Phòng ngủ</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="shower" size={20} color={colors.accentColor} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{room.bathrooms}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Phòng tắm</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="account-group" size={20} color={colors.accentColor} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {room.cur_people}/{room.max_people}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Người thuê</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Description Card */}
        {room.description && (
          <Card style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Card.Content>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Mô tả</Text>
              <Text style={[styles.description, { color: colors.textPrimary }]}>
                {room.description}
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {/* House Info Card */}
        <Card style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Thông tin căn nhà</Text>
            
            <View style={styles.houseInfoItem}>
              <Icon name="home" size={20} color={colors.accentColor} />
              <Text style={[styles.houseInfoText, { color: colors.textPrimary }]}>
                {room.house_title}
              </Text>
            </View>
            
            <View style={styles.houseInfoItem}>
              <Icon name="map-marker" size={20} color={colors.accentColor} />
              <Text style={[styles.houseInfoText, { color: colors.textPrimary }]}>
                {room.house_address}
              </Text>
            </View>
            
            <Button
              mode="outlined"
              icon="arrow-right"
              onPress={() => navigation.navigate('HouseDetail', { houseId: room.house })}
              style={styles.viewHouseButton}
            >
              Xem chi tiết nhà
            </Button>
          </Card.Content>
        </Card>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={handleEditRoom}
            style={[styles.editButton, { backgroundColor: colors.accentColor }]}
          >
            Chỉnh sửa phòng
          </Button>
          
          <Button
            mode="outlined"
            icon="delete"
            onPress={handleDeleteRoom}
            style={[styles.deleteButton, { borderColor: colors.dangerColor }]}
            color={colors.dangerColor}
          >
            Xóa phòng
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
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
  galleryContainer: {
    margin: 10,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  thumbnailsContainer: {
    marginTop: 10,
  },
  thumbnailWrapper: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  noImageContainer: {
    height: 250,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 10,
    fontSize: 16,
  },
  infoCard: {
    margin: 10,
    marginTop: 5,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  description: {
    lineHeight: 20,
  },
  houseInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  houseInfoText: {
    marginLeft: 10,
    fontSize: 15,
  },
  viewHouseButton: {
    marginTop: 10,
  },
  actionButtons: {
    margin: 10,
    marginBottom: 40,
  },
  editButton: {
    marginBottom: 10,
  },
  deleteButton: {
    marginBottom: 10,
  },
});
