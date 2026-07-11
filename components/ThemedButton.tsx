import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  ghost: 'bg-transparent text-muted hover:bg-elevated hover:text-text',
  primary: 'bg-primary text-canvas hover:bg-primary/85',
  secondary: 'bg-secondary text-text hover:bg-secondary/80',
};

const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  className = '',
  variant = 'secondary',
  ...props
}) => (
  <button
    className={[
      'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-motion',
      'outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50',
      VARIANT_CLASS[variant],
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </button>
);

export default ThemedButton;
