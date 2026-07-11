export const THEMES = ['dark', 'light', 'contrast'] as const;

export type ThemeName = (typeof THEMES)[number];

export type ThemeOption = {
  label: string;
  name: ThemeName;
};

export const DEFAULT_THEME: ThemeName = 'dark';
export const THEME_STORAGE_KEY = 'calliope-canvas-theme';

export const THEME_OPTIONS: ThemeOption[] = [
  { label: 'Dark', name: 'dark' },
  { label: 'Light', name: 'light' },
  { label: 'Contrast', name: 'contrast' },
];

export const isThemeName = (theme: unknown): theme is ThemeName =>
  typeof theme === 'string' && THEMES.includes(theme as ThemeName);

export const getStoredTheme = (): ThemeName => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeName(storedTheme) ? storedTheme : DEFAULT_THEME;
};

export const persistTheme = (theme: ThemeName) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};
