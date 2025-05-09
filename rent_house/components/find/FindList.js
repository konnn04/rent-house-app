import Title from "./Title";
import Filters from "./Filters";
import SearchBar from "./SearchBar";
import { View, Text } from "react-native";
import { styles } from "../../styles/style";
import { useTheme } from "../../contexts/ThemeContext";

const FindList = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, {backgroundColor: colors.backgroundPrimary, padding: 10}]}> 
            <Title />
            <SearchBar />
            <Filters />
            <Text style={styles.text}>Danh sách tìm kiếm</Text>
        </View>
    );
}

export default FindList;