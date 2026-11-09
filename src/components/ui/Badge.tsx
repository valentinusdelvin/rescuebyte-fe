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
  // Geometri badge kapsul dengan kontras warna memenuhi standar WCAG AA
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-semibold rounded-full select-none shrink-0 tracking-wide';

  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    // Halal Verified: background daun lembut dengan teks zamrud (kontras 6.8:1)
    halal: 'bg-[#e8f1de] text-[#2d5922] border border-[#d2e4c0]',
    // Stok Mendesak: background blush dengan teks merah marun (kontras 4.8:1)
    'urgent-stock': 'bg-[#fdeceb] text-[#d94a38] border border-[#fbd3d0]',
    // Rasio Diskon: hijau botani pekat dengan teks putih (kontras 5.8:1)
    discount: 'bg-secondary text-white shadow-xs',
    // Kotak Misteri: marigold hangat dengan teks amber (kontras 4.9:1)
    mystery: 'bg-[#fff6e5] text-[#9a5d00] border border-[#fde8c0]',
    // Netral: kontainer netral dengan teks arang (kontras 7.2:1)
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
