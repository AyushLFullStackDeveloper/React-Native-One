import { useThemeContext } from './ThemeContext';

export const useTheme = () => {
  const context = useThemeContext();
  return {
    colors: context.colors,
    isDark: context.isDark,
    themeMode: context.themeMode,
    setThemeMode: context.setThemeMode,
    toggleTheme: context.toggleTheme,
  };
};
