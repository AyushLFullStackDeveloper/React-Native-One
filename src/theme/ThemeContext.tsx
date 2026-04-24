import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: typeof colors.light;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  const toggleTheme = () => {
    console.log('[ThemeContext] Toggling theme from:', themeMode);
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    console.log('[ThemeContext] Current Theme:', themeMode, '| isDark:', isDark);
  }, [themeMode, isDark]);

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      setThemeMode, 
      isDark, 
      colors: themeColors,
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
