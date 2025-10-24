/**
 * ErrorBoundary
 * Provides a simple React error boundary with fallback UI.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Terjadi Kesalahan</Text>
          <Text style={styles.subtitle}>
            Kami mengalami gangguan sementara. Silakan coba lagi nanti.
          </Text>
          {__DEV__ && this.state.message ? <Text style={styles.message}>{this.state.message}</Text> : null}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    color: '#1F2933',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#52606D',
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    color: '#EF4444',
  },
});

