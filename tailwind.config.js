/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './slides/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
        focus: 'rgb(var(--color-focus) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
      },
      transitionDuration: {
        motion: 'var(--duration-motion)',
      },
    },
  },
  plugins: [],
};
