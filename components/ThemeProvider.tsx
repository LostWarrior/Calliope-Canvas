import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_THEME, getStoredTheme, persistTheme, type ThemeName } from '../theme';

type ThemeContextValue = {
  setTheme: (theme: ThemeName) => void;
  theme: ThemeName;
};

const ThemeContext = createContext<ThemeContextValue>({
  setTheme: () => undefined,
  theme: DEFAULT_THEME,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(getStoredTheme);

  const setTheme = useCallback((nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    persistTheme(nextTheme);
  }, []);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  const value = useMemo(() => ({ setTheme, theme }), [setTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
