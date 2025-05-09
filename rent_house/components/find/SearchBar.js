import Colors from '@/constants/Colors';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const SearchBar = ({ onSearch }) => {
    const { colors } = useTheme();

    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (onSearch) {
            onSearch(query);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }]}
                value={query}
                onChangeText={setQuery}
                placeholder="Search for properties..."
                placeholderTextColor={colors.textSecondary}
                borderColor={colors.borderColor}
            />
            <TouchableOpacity onPress={handleSearch} style={[styles.button, { backgroundColor: colors.accentColor  }]}>
                <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 10,
    },
    button: {
        height: 50,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SearchBar;