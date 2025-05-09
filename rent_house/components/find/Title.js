import React from 'react';
import { Text } from 'react-native';
import {homeStyles} from '../../styles/style';
import { useTheme } from '../../contexts/ThemeContext';

const Title = () => {
    const { colors } = useTheme();
    return <Text style={[homeStyles.title, {color: colors.textPrimary, paddingTop: 10 }]}>RENT HOUSE search</Text>;
};

export default Title;