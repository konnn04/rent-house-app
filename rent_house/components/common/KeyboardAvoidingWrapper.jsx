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
    headerHeight = useHeaderHeight();
  } catch (error) {
    headerHeight = Platform.OS === 'ios' ? 44 : 56;
  }

  const scrollViewRef = useRef(null);

  const keyboardVerticalOffset = Platform.OS === 'ios'
    ? headerHeight + extraOffset
    : headerHeight + extraOffset;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
