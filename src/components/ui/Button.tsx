import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'urgent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Style interaktif dasar dengan indikator focus yang aksesibel
    const baseStyles =
      'inline-flex items-center justify-center font-sans transition-all duration-200 cursor-pointer select-none ' +
      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    // Varian warna Botanical Rescue
    const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-primary text-white hover:bg-primary-dark shadow-xs hover:shadow-level-1',
      secondary:
        'bg-secondary-soft text-primary hover:bg-[#dde8d2] shadow-xs',
      outline:
        'bg-transparent border border-outline-variant text-primary hover:bg-surface-container-low hover:border-outline',
      urgent:
        'bg-urgent text-white hover:bg-[#c43b2a] shadow-xs',
      ghost:
        'bg-transparent text-primary hover:bg-surface-container hover:text-on-surface',
    };

    // Standar ukuran responsive dan target sentuh minimal
    const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-9 px-3.5 text-xs font-semibold rounded-lg gap-1.5',
      md: 'h-11 px-5 text-sm font-semibold rounded-xl gap-2',
      lg: 'h-12 px-6 text-base font-bold rounded-xl gap-2.5',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-0.5 h-4 w-4 text-current shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="status"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Memuat...</span>
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0 flex items-center justify-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0 flex items-center justify-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
