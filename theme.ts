export const THEMES = [
  'dark',
  'light',
  'contrast',
  'sunset',
  'forest',
  'sepia',
  'stormy-morning',
  'ocean-tide',
  'space-berries',
  'desert-dusk',
  'night-sands',
  'lavender-fields',
  'winter-chill',
  'italian-leather',
  'above-the-surface',
] as const;

export type ThemeName = (typeof THEMES)[number];

export type ThemeOption = {
  label: string;
  name: ThemeName;
};

export const DEFAULT_THEME: ThemeName = 'sepia';
export const THEME_STORAGE_KEY = 'calliope-canvas-theme';

export const THEME_OPTIONS: ThemeOption[] = [
  { label: 'Dark', name: 'dark' },
  { label: 'Light', name: 'light' },
  { label: 'Contrast', name: 'contrast' },
  { label: 'Sunset', name: 'sunset' },
  { label: 'Forest', name: 'forest' },
  { label: 'Sepia', name: 'sepia' },
  { label: 'Stormy morning', name: 'stormy-morning' },
  { label: 'Ocean tide', name: 'ocean-tide' },
  { label: 'Space berries', name: 'space-berries' },
  { label: 'Desert dusk', name: 'desert-dusk' },
  { label: 'Night sands', name: 'night-sands' },
  { label: 'Lavender fields', name: 'lavender-fields' },
  { label: 'Winter chill', name: 'winter-chill' },
  { label: 'Italian leather', name: 'italian-leather' },
  { label: 'Above the surface', name: 'above-the-surface' },
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
