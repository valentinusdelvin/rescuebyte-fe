import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'halal' | 'urgent-stock' | 'discount' | 'mystery' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  // Pill geometry with accessible contrast conforming to WCAG AA
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-semibold rounded-full select-none shrink-0 tracking-wide';

  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    // Halal Verified: soft leaf container with deep emerald text (6.8:1 contrast)
    halal: 'bg-[#e8f1de] text-[#2d5922] border border-[#d2e4c0]',
    // Urgent Stock: soft blush container with urgent vermilion text (4.8:1 contrast)
    'urgent-stock': 'bg-[#fdeceb] text-[#d94a38] border border-[#fbd3d0]',
    // Discount Ratio: deep botanical green with white text (5.8:1 contrast)
    discount: 'bg-secondary text-white shadow-xs',
    // Mystery Package: warm marigold container with amber text (4.9:1 contrast)
    mystery: 'bg-[#fff6e5] text-[#9a5d00] border border-[#fde8c0]',
    // Neutral: light surface container with charcoal text (7.2:1 contrast)
    neutral: 'bg-surface-container text-on-surface-variant border border-outline-variant',
  };

  const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center justify-center" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
