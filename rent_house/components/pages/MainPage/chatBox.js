import { React , useState } from "react";
import { View, Text } from "react-native";
import { styles } from "../../../styles/style";
const ChatBox = () => {

    return (<View style={styles.container}>
        <Text style={styles.text}>Chat Box</Text>
        <Text style={styles.text}>User 1: Hello!</Text>
        <Text style={styles.text}>User 2: Hi!</Text>
    </View>);
}

export default ChatBox; // Add this line