import React from 'react';

import { isThemeName, THEME_OPTIONS } from '../theme';
import { useTheme } from './ThemeProvider';

interface ThemeSelectorProps {
  label?: string;
  onThemeChange?: (theme: (typeof THEME_OPTIONS)[number]['name']) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ label = 'Theme', onThemeChange }) => {
  const { setTheme, theme } = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (isThemeName(event.target.value)) {
      setTheme(event.target.value);
      onThemeChange?.(event.target.value);
    }
  };

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-muted">
      <span>{label}</span>
      <select
        value={theme}
        onChange={handleThemeChange}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm font-semibold text-text outline-none transition-colors duration-motion hover:bg-elevated focus-visible:ring-2 focus-visible:ring-focus"
      >
        {THEME_OPTIONS.map(option => (
          <option key={option.name} value={option.name}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ThemeSelector;
