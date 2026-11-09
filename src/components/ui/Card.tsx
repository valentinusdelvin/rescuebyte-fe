import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'bg-white border border-outline-variant rounded-2xl overflow-hidden font-sans';

    const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
      default: 'shadow-level-1',
      flat: 'shadow-none',
      elevated: 'shadow-level-2',
      interactive:
        'shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
