/**
 * HealthyCoaching Indonesia - Main Entry Point
 * Health & wellness coaching app untuk pasar Indonesia
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';

// Error boundary setup for production
import './setupErrorReporting';

// Performance monitoring
import './setupPerformanceMonitoring';

AppRegistry.registerComponent(appName, () => App);

// Register modules for Android
if (__DEV__) {
  // Enable flipper in development
  import('./flipper');
}