import { api } from '../../utils/Fetch';
import { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { HouseDetailHeader } from './HouseDetailHeader';
import { HouseDetailImage } from './HouseDetailImage';
import { HouseDetail_Info } from './HouseDetail_Info';

export const HouseDetail = () => {
    const route = useRoute();
    const { houseId } = route.params; // Lấy ID của nhà từ route params
    const [houseDetail, setHouseDetail] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHouseDetail = async () => {
            try {
                const response = await api.get(`/api/houses/${houseId}/`);
                setHouseDetail(response.data);
            } catch (error) {
                console.error('Error fetching house detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHouseDetail();
    }, [houseId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!houseDetail) {
        return (
            <View style={styles.center}>
                <Text>Không thể tải thông tin chi tiết.</Text>
            </View>
        );
    }
    const images = houseDetail.media.map(item => ({ url: item.url }));
    const info  = [
        { name: 'address', label: 'Địa chỉ', value: houseDetail.address },
        { name: 'type', label: 'Loại nhà', value: houseDetail.type },
        { name: 'base_price', label: 'Giá cơ bản', value: `${houseDetail.base_price} VND` },
        { name: 'avg_rating', label: 'Đánh giá trung bình', value: `${houseDetail.avg_rating} ⭐` },
        { name: 'full_name', label: 'Chủ sở hữu', value: houseDetail.owner.full_name },
        { name: 'room_count', label: 'Số phòng', value: houseDetail.room_count },
        { name: 'available_rooms', label: 'Phòng còn trống', value: houseDetail.available_rooms },
    ];
    return (
        <View style={styles.container}>
            <HouseDetailHeader title="Chi tiết nhà" />
            <ScrollView style={styles.container}>
                <HouseDetailImage images ={images} />
            <HouseDetail_Info info={info} />
            <Text style={styles.subtitle}>Danh sách phòng:</Text>
            <FlatList
                data={houseDetail.rooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.roomCard}>
                        <Image
                            source={{ uri: item.thumbnail }}
                            style={styles.roomThumbnail}
                        />
                        <Text>{item.title}</Text>
                        <Text>Giá: {item.price} VND</Text>
                        <Text>Diện tích: {item.area} m²</Text>
                        <Text>Số người tối đa: {item.max_people}</Text>
                        <Text>Trạng thái: {item.is_available ? 'Còn trống' : 'Đã đầy'}</Text>
                    </View>
                )}
            />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        width: '100%',
        height: 200,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    roomCard: {
        marginBottom: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    roomThumbnail: {
        width: '100%',
        height: 100,
        marginBottom: 8,
    },
});


