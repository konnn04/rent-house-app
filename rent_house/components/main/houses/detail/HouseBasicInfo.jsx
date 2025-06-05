import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Chip, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../../../contexts/ThemeContext";
import { formatCurrency } from "../../../../utils/Tools";

export const HouseBasicInfo = ({ house }) => {
  const { colors } = useTheme();

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${house.latitude},${house.longitude}`;
    Linking.openURL(url);
  };

  const getHouseTypeText = (type) => {
    const types = {
      house: "Nhà riêng",
      apartment: "Căn hộ",
      dormitory: "Ký túc xá",
      room: "Phòng trọ",
    };
    return types[type] || "Nhà";
  };

  const format_houses_Type = (house) => {
    const icons = {
      house: "home",
      apartment: "home-city",
      dormitory: "school",
      room: "bed",
    };
    if (house.type === "house" || house.type === "apartment") {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon
              name={icons[house.type]}
              size={16}
              color={colors.accentColor}
            />
            <Text style={[styles.statText, { color: house.is_renting ? colors.dangerColor : colors.successColor }]}>
              {!house.is_renting ? "Trống" : "Đã thuê"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="account-group" size={16} color={colors.successColor} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Tối đa {house.max_people || 0} người
            </Text>
          </View>
        </View>
      );
    }
    if (house.type === "dormitory" || house.type === "room") {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon
              name={icons[house.type]}
              size={16}
              color={colors.accentColor}
            />
            <Text style={[styles.statText, { color: house.max_rooms > house.current_rooms  ?  colors.successColor :  colors.dangerColor}]}>
              {house.max_rooms > house.current_rooms ? `Còn ${house.max_rooms - house.current_rooms}` : "Hết " || 0}{" "}
              phòng
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="account-group" size={16} color={colors.successColor} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Tối đa {house.max_people || 0} người
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
      ]}
    >
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {house.title}
        </Text>
        {house.is_verified && (
          <Chip
            icon="check-circle"
            mode="outlined"
            style={[styles.verifiedChip, { borderColor: colors.successColor }]}
            textStyle={{ color: colors.successColor }}
          >
            Đã xác thực
          </Chip>
        )}
      </View>

      <View style={styles.typeAndPriceContainer}>
        <Chip icon="home" mode="outlined" style={styles.typeChip}>
          {getHouseTypeText(house.type)}
        </Chip>

        <Text style={[styles.price, { color: colors.accentColor }]}>
          {formatCurrency(house.base_price)}/tháng
        </Text>
      </View>

      <Divider
        style={[styles.divider, { backgroundColor: colors.borderColor }]}
      />

      <TouchableOpacity
        style={styles.addressContainer}
        onPress={handleOpenMaps}
      >
        <Icon name="map-marker" size={20} color={colors.accentColor} />
        <Text style={[styles.address, { color: colors.textPrimary }]}>
          {house.address}
        </Text>
        <Icon
          name="directions"
          size={18}
          color={colors.accentColor}
          style={styles.directionsIcon}
        />
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        {format_houses_Type(house)}

        <View style={styles.statItem}>
          <Icon name="star" size={18} color="#FFD700" />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {house.avg_rating ? house.avg_rating.toFixed(1) : "Chưa có"} sao
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  verifiedChip: {
    height: 28,
  },
  typeAndPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeChip: {
    height: 32,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  address: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  directionsIcon: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 7,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 5,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
});
