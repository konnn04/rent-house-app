import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Divider } from 'react-native-paper';
import HTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';

export const DescriptionSection = ({ description }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  
  // Max number of lines when collapsed
  const MAX_LINES = 5;
  
  // Handle toggle description expansion
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Mô tả
      </Text>
      <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      
      <View style={styles.descriptionContainer}>
        {/* Render HTML content if it's HTML, otherwise plain text */}
        {description.includes('<') && description.includes('>') ? (
          <HTML 
            source={{ html: expanded ? description : description.split('\n').slice(0, MAX_LINES).join('\n') }}
            contentWidth={width - 50}
            baseStyle={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}
          />
        ) : (
          <Text 
            style={[styles.descriptionText, { color: colors.textSecondary }]} 
            numberOfLines={expanded ? undefined : MAX_LINES}
          >
            {description}
          </Text>
        )}
        
        {/* Show "Read more" button if text is long */}
        {description.split('\n').length > MAX_LINES && (
          <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
            <Text style={[styles.expandButtonText, { color: colors.accentColor }]}>
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </Text>
            <Icon 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={colors.accentColor} 
            />
          </TouchableOpacity>
        )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  divider: {
    marginBottom: 15,
  },
  descriptionContainer: {
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  expandButtonText: {
    fontWeight: '500',
    marginRight: 5,
  },
});
