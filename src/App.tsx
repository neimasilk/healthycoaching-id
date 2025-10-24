/**
 * HealthyCoaching Indonesia - Root Component
 * Main application container with navigation and providers
 */

import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Theme and styling
import { ThemeProvider } from '@/shared/theme/ThemeProvider';

// State management
import { store, persistor } from '@/shared/store/store';

// Navigation
import AppNavigator from '@/core/presentation/navigation/AppNavigator';

// Error boundary
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Services
import { setupServices } from '@/core/di/ServiceContainer';

// Initialize services
setupServices();

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <NavigationContainer>
              <StatusBar
                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                backgroundColor="#4CAF50"
                translucent={false}
              />
              <AppNavigator />
            </NavigationContainer>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;