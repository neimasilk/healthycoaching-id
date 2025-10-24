/**
 * ThemeProvider
 * Basic application theme context to unblock initial app render.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { Appearance } from 'react-native';

interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    text: string;
    primary: string;
    surface: string;
  };
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const fallbackTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    text: '#1F2933',
    primary: '#4CAF50',
    surface: '#F4F6F8',
  },
};

const ThemeContext = createContext<Theme>(fallbackTheme);

export const useTheme = (): Theme => useContext(ThemeContext);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();

  const theme = useMemo((): Theme => {
    if (colorScheme === 'dark') {
      return {
        mode: 'dark',
        colors: {
          background: '#121212',
          text: '#F5F5F5',
          primary: '#81C784',
          surface: '#1E1E1E',
        },
      };
    }

    return fallbackTheme;
  }, [colorScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

