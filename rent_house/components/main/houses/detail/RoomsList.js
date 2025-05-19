import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { RoomCard } from '../../rooms/RoomCard';

export const RoomsList = ({ rooms = [], houseId, isOwner }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  // Navigate to room details
  const handleRoomPress = (roomId) => {
    navigation.navigate('RoomDetail', { roomId, houseId });
  };
  
  // Navigate to add room screen
  const handleAddRoom = () => {
    navigation.navigate('AddRoom', { houseId });
  };
  
  if (!rooms || rooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Chưa có phòng nào
        </Text>
        {isOwner && (
          <Text
            style={[styles.addRoomText, { color: colors.accentColor }]}
            onPress={handleAddRoom}
          >
            + Thêm phòng mới
          </Text>
        )}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onPress={() => handleRoomPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Important: disable scrolling since we're in a ScrollView
        ListFooterComponent={
          isOwner ? (
            <Text
              style={[styles.addRoomText, { color: colors.accentColor }]}
              onPress={handleAddRoom}
            >
              + Thêm phòng mới
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  listContent: {
    paddingVertical: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 15,
  },
  addRoomText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
});
