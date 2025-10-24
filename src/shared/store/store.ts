/**
 * Redux store bootstrap
 * Provides a minimal Redux Toolkit store to unblock app rendering.
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Placeholder slices can be replaced once real reducers are ready.
const rootReducer = combineReducers({
  // Example: nutrition: nutritionReducer,
});

const persistConfig = {
  key: 'healthycoaching-root',
  storage: AsyncStorage,
  whitelist: [], // Populate as soon as slices need persistence.
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

