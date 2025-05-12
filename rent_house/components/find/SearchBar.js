import Colors from '@/constants/Colors';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Searchbar } from 'react-native-paper';

const SearchBar = ({ onSearch, fillter, value }) => {
    const { colors } = useTheme();

    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (onSearch) {
            onSearch(query);
        }
    };

    return (
        <View>
            <Searchbar
                placeholder="Search"
                onChangeText={setQuery}
                value={query}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
});

export default SearchBar;