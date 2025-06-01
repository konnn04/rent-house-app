import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Platform, RefreshControl, ScrollView,
    Share, StatusBar, StyleSheet, Text, View
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { getDetailHouseService } from '../../../../services/houseService';
import { createDirectChat } from "../../../../utils/ChatUtils";

// Import components
import { ContactSection } from './ContactSection';
import { DescriptionSection } from './DescriptionSection';
import { HouseBasicInfo } from './HouseBasicInfo';
import { HouseGallery } from './HouseGallery';
import { HousePriceInfo } from './HousePriceInfo';
import { OwnerInfo } from './OwnerInfo';
import { RatingsSection } from './RatingsSection';

export const HouseDetailScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { userData } = useUser();

    const houseId = route.params?.houseId;

    const [house, setHouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'reviews'
    const [contactLoading, setContactLoading] = useState(false);

    // Fetch house details
    const fetchHouseDetails = useCallback(async () => {
        if (!houseId) {
            setError('Không tìm thấy ID nhà');
            setLoading(false);
            return;
        }

        try {
            setError(null);
            if (!refreshing) setLoading(true);

            const houseDetails = await getDetailHouseService(houseId);
            setHouse(houseDetails);

        } catch (err) {
            console.error('Error fetching house details:', err);
            setError('Không thể tải thông tin nhà. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [houseId, refreshing]);

    useEffect(() => {
        fetchHouseDetails();
    }, [fetchHouseDetails]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchHouseDetails();
    };

    const handleContactOwner = async () => {
        if (!house.owner.id || !house.owner.username) {
            Alert.alert('Lỗi', 'Không thể liên hệ với chủ nhà.');
            return;
        }
        
        setContactLoading(true);
        try {
            await createDirectChat(
                house.owner.id,
                house.owner.full_name || house.owner.username,
                navigation,
                setContactLoading
            );
        } catch (error) {
            console.error('Error creating chat:', error);
            setContactLoading(false);
            Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện với chủ nhà.');
        }
    };

    // Handle share
    const handleShare = async () => {
        if (!house) return;

        try {
            await Share.share({
                message: `Xem nhà "${house.title}" ở địa chỉ: ${house.address} với giá ${house.base_price.toLocaleString('vi-VN')} VNĐ/tháng`,
                title: house.title,
            });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chia sẻ nhà này.');
        }
    };

    // Handle edit house (for owners)
    const handleEditHouse = () => {
        navigation.navigate('EditHouse', { houseId: house.id });
    };

    // Go back
    const handleGoBack = () => {
        navigation.goBack();
    };

    // Render loading state
    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]} edges={['top']}>
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        iconColor={colors.textPrimary}
                        size={24}
                        onPress={handleGoBack}
                    />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accentColor} />
                    <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
                        Đang tải thông tin...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]} edges={['top']}>
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        iconColor={colors.textPrimary}
                        size={24}
                        onPress={handleGoBack}
                    />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.dangerColor }]}>{error}</Text>
                    <IconButton
                        icon="refresh"
                        iconColor={colors.accentColor}
                        size={30}
                        onPress={fetchHouseDetails}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // Check if user is the owner
    const isOwner = userData?.id === house?.owner?.id;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <IconButton
              icon="arrow-left"
              iconColor="white"
              size={24}
              style={styles.backButton}
              onPress={handleGoBack}
          />

          <View style={styles.headerActions}>
              <IconButton
                  icon="share-variant"
                  iconColor="white"
                  size={24}
                  style={styles.actionButton}
                  onPress={handleShare}
              />

              {isOwner && (
                  <IconButton
                      icon="pencil"
                      iconColor="white"
                      size={24}
                      style={styles.actionButton}
                      onPress={handleEditHouse}
                  />
              )}
          </View>
        </View>

        {/* Main Content */}
        {house && (
          <View style={styles.contentContainer}>
              {/* Gallery and Basic Info */}
              <ScrollView
                  refreshControl={
                      <RefreshControl
                          refreshing={refreshing}
                          onRefresh={handleRefresh}
                          colors={[colors.accentColor]}
                          tintColor={colors.accentColor}
                      />
                  }
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                  showsVerticalScrollIndicator={false}
              >
                  {/* Gallery */}
                  <HouseGallery media={house.media} />

                  {/* Basic Info */}
                  <HouseBasicInfo house={house} />

                  {/* Tab Navigation */}
                  <View style={[styles.tabContainer, { backgroundColor: colors.backgroundSecondary }]}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <Text
                              style={[
                                  styles.tabButton,
                                  activeTab === 'info' && [styles.activeTab, { borderColor: colors.accentColor }],
                                  { color: activeTab === 'info' ? colors.accentColor : colors.textSecondary }
                              ]}
                              onPress={() => setActiveTab('info')}
                          >
                              Thông tin
                          </Text>
                          <Text
                              style={[
                                  styles.tabButton,
                                  activeTab === 'reviews' && [styles.activeTab, { borderColor: colors.accentColor }],
                                  { color: activeTab === 'reviews' ? colors.accentColor : colors.textSecondary }
                              ]}
                              onPress={() => setActiveTab('reviews')}
                          >
                              Đánh giá ({house.avg_rating ? `${house.avg_rating.toFixed(1)}★` : 'Chưa có'})
                          </Text>
                      </ScrollView>
                  </View>
                  
                  {/* Tab Content */}
                  {activeTab === 'info' && (
                      <View style={styles.tabContent}>
                          <OwnerInfo owner={house.owner} />
                          <HousePriceInfo house={house} />
                          {house.description && <DescriptionSection description={house.description} />}
                      </View>
                  )}
                  
                  {activeTab === 'reviews' && (
                      <View style={styles.tabContent}>
                          <RatingsSection houseId={house.id} avgRating={house.avg_rating} insideScrollView={true} />
                      </View>
                  )}
              </ScrollView>

              {/* Contact Section - only show if user is not the owner */}
              {!isOwner && house && (
                  <ContactSection 
                      house={house} 
                      onContactPress={handleContactOwner} 
                      isLoading={contactLoading}
                  />
              )}
          </View>
        )}
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 100, // Extra space for contact section
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 10 : 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
        paddingHorizontal: 10,
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        marginLeft: 8,
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
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop: 10,
        marginHorizontal: 10,
        borderRadius: 10,
    },
    tabButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 5,
        fontWeight: 'bold',
    },
    activeTab: {
        borderBottomWidth: 3,
    },
    tabContent: {
        paddingBottom: 20,
    },
});
