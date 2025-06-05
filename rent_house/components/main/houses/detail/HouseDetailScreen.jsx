import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Platform, RefreshControl, ScrollView,
    StatusBar, StyleSheet, Text, View
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUser } from '../../../../contexts/UserContext';
import { getDetailHouseService } from '../../../../services/houseService';
import { createDirectChat } from "../../../../utils/ChatUtils";
import { PaperDialog } from '../../../common/PaperDialog';

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
    const [activeTab, setActiveTab] = useState('info'); 
    const [contactLoading, setContactLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });

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

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHouseDetails();
    };

    const handleContactOwner = async () => {
        if (!house.owner.id || !house.owner.username) {
            setDialogContent({
                title: 'Lỗi',
                message: 'Không thể liên hệ với chủ nhà.',
                actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
            });
            setDialogVisible(true);
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
            setDialogContent({
                title: 'Lỗi',
                message: 'Không thể tạo cuộc trò chuyện với chủ nhà.',
                actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
            });
            setDialogVisible(true);
        }
    };

    // const handleShare = async () => {
    //     if (!house) return;
    //     try {
    //         await Share.share({
    //             message: `Xem nhà "${house.title}" ở địa chỉ: ${house.address} với giá ${house.base_price.toLocaleString('vi-VN')} VNĐ/tháng`,
    //             title: house.title,
    //         });
    //     } catch (error) {
    //         setDialogContent({
    //             title: 'Lỗi',
    //             message: 'Không thể chia sẻ nhà này.',
    //             actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
    //         });
    //         setDialogVisible(true);
    //     }
    // };

    const handleEditHouse = () => {
        navigation.navigate('EditHouse', { houseId: house.id });
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

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

    const isOwner = userData?.id === house?.owner?.id;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        <View style={styles.header}>
          <IconButton
              icon="arrow-left"
              iconColor="white"
              size={24}
              style={styles.backButton}
              onPress={handleGoBack}
          />

          <View style={styles.headerActions}>
              {/* <IconButton
                  icon="share-variant"
                  iconColor="white"
                  size={24}
                  style={styles.actionButton}
                  onPress={handleShare}
              /> */}

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

        {house && (
          <View style={styles.contentContainer}>
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
                  <HouseGallery media={house.media} />

                  <HouseBasicInfo house={house} />

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

              {!isOwner && house && (
                  <ContactSection 
                      house={house} 
                      onContactPress={handleContactOwner} 
                      isLoading={contactLoading}
                  />
              )}
          </View>
        )}

        <PaperDialog
          visible={dialogVisible}
          title={dialogContent.title}
          message={dialogContent.message}
          actions={dialogContent.actions}
          onDismiss={() => setDialogVisible(false)}
        />
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
        paddingBottom: 100, 
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
