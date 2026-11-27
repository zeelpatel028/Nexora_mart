import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './navigation/context/AuthContext';
import { ThemeProvider } from './navigation/context/ThemeContext';
import { StoreProvider } from './navigation/context/StoreContext';
import { SettingsProvider } from './navigation/context/SettingsContext';
import RootNavigator from './navigation/RootNavigator';

enableScreens(true);

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorStack?: string;
  componentStack?: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null, errorStack: '', componentStack: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorStack: error?.stack || '', componentStack: '' };
  }

  componentDidCatch(error: Error, info: any) {
    const jsStack = error?.stack || '';
    const compStack = info?.componentStack || '';
    console.error('UI Exception caught by ErrorBoundary:', error?.name, error?.message);
    if (jsStack) console.error('ErrorBoundary JS Stack:\n' + jsStack);
    if (compStack) console.error('ErrorBoundary Component Stack:\n' + compStack);
    this.setState({ errorStack: jsStack, componentStack: compStack });
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorStack: '', componentStack: '' });
  };

  render() {
    if (this.state.hasError) {
      const devDetails = __DEV__
        ? [this.state.errorStack, this.state.componentStack].filter(Boolean).join('\n\n')
        : this.state.componentStack || this.state.errorStack || '';

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          {devDetails ? (
            <ScrollView style={styles.stackBox} contentContainerStyle={styles.stackContent}>
              <Text style={styles.stackText} selectable>
                {devDetails}
              </Text>
            </ScrollView>
          ) : null}
          <TouchableOpacity style={styles.reloadBtn} onPress={this.handleRestart}>
            <Text style={styles.reloadBtnText}>Restart Application</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <SettingsProvider>
            <AuthProvider>
              <StoreProvider>
                <RootNavigator />
              </StoreProvider>
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  reloadBtn: {
    backgroundColor: '#F57C00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  reloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stackBox: {
    maxHeight: 180,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: '100%',
  },
  stackContent: {
    paddingBottom: 6,
  },
  stackText: {
    fontSize: 11,
    color: '#4B5563',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default App;
