import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const HouseDetail_Info = ({ info }) => {
    const { colors } = useTheme();
    return (
        <ScrollView style={[styles.container, { color: colors.textPrimary }]}>
            {info.map((item) => (
                <View key={item.name} style={[styles.infoRow, { color: colors.textPrimary }]}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>{item.label}:</Text>
                    <Text style={[styles.value, { color: colors.textPrimary }]}>{item.value}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
        marginTop: 115,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    value: {
        flex: 1,
    },
});