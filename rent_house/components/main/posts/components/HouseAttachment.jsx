import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../../../contexts/ThemeContext";
import { formatCurrency } from "../../../../utils/Tools";

export const HouseAttachment = ({ house, onPress }) => {
  const { colors } = useTheme();

  if (!house) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: house.thumbnail || "https://via.placeholder.com/100" }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {house.title}
        </Text>
        <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
          {house.address}
        </Text>
        <View style={styles.row}>
          <Icon name="home" size={14} color={colors.accentColor} />
          <Text style={[styles.type, { color: colors.textSecondary }]}>
            {house.type === "apartment"
              ? "Căn hộ"
              : house.type === "dormitory"
              ? "Ký túc xá"
              : house.type === "room"
              ? "Phòng trọ"
              : "Nhà riêng"}
          </Text>
          <Icon name="star" size={14} color="#FFD700" style={{ marginLeft: 10 }} />
          <Text style={[styles.rating, { color: colors.textSecondary }]}>
            {house.avg_rating ? house.avg_rating.toFixed(1) : "--"}
          </Text>
        </View>
        <Text style={[styles.price, { color: colors.accentColor }]}>
          {formatCurrency(house.base_price)}/tháng
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    marginLeft: 4,
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  price: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 2,
  },
});
