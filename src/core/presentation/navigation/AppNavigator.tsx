/**
 * AppNavigator
 * Minimal navigation scaffold so the app can render.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const PlaceholderScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>HealthyCoaching Indonesia</Text>
    <Text style={styles.subtitle}>Mulai bangun fitur utama di sini.</Text>
  </View>
);

const AppNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={PlaceholderScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2933',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#52606D',
    textAlign: 'center',
  },
});

export default AppNavigator;

