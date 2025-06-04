import { useHeaderHeight } from '@react-navigation/elements';
import { useRef } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Global keyboard avoiding component that handles keyboard behavior across the app
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} props.withScrollView - Whether to wrap children in a ScrollView (default: false)
 * @param {Object} props.containerStyle - Additional styles for the container
 * @param {Object} props.scrollViewProps - Additional props for ScrollView (if used)
 * @param {number} props.extraOffset - Additional offset beyond header height (default: 20)
 */
export const KeyboardAvoidingWrapper = ({
  children,
  withScrollView = false,
  containerStyle,
  scrollViewProps = {},
  extraOffset = 20,
}) => {
  const { colors } = useTheme();
  let headerHeight = 0;
  
  try {
    // Try to get header height, use 0 if not available
    headerHeight = useHeaderHeight();
  } catch (error) {
    // If not in a navigation context, use default height
    headerHeight = Platform.OS === 'ios' ? 44 : 56;
  }

  const scrollViewRef = useRef(null);

  // Calculate keyboard vertical offset based on platform and header height
  const keyboardVerticalOffset = Platform.OS === 'ios'
    ? headerHeight + extraOffset
    : headerHeight + extraOffset;

  // Dismiss keyboard when tapping outside input fields
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Content to be rendered inside the KeyboardAvoidingView
  const content = withScrollView ? (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollViewContent,
        { backgroundColor: colors.backgroundPrimary }
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundPrimary },
        containerStyle
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        {content}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  }
});
