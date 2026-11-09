import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const customStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  if (variant === 'card') {
    return (
      <div
        className={`bg-white border border-outline-variant rounded-2xl overflow-hidden p-4 space-y-3.5 shadow-level-1 animate-pulse ${className}`.trim()}
        style={customStyles}
        role="status"
        aria-label="Memuat konten..."
        {...props}
      >
        {/* Card Image Area */}
        <div className="w-full aspect-16/10 rounded-xl bg-surface-container-high" />

        {/* Card Header and Badges */}
        <div className="space-y-2">
          <div className="h-4 bg-surface-container-high rounded-md w-3/4" />
          <div className="h-3 bg-surface-container-high rounded-md w-1/2" />
        </div>

        {/* Card Footer / Price / CTA */}
        <div className="pt-2 flex items-center justify-between border-t border-outline-variant/60">
          <div className="space-y-1 w-1/3">
            <div className="h-2.5 bg-surface-container-high rounded-md w-2/3" />
            <div className="h-4 bg-surface-container-high rounded-md w-full" />
          </div>
          <div className="h-9 w-24 bg-surface-container-high rounded-xl" />
        </div>
      </div>
    );
  }

  const variantStyles: Record<Exclude<NonNullable<SkeletonProps['variant']>, 'card'>, string> = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      role="status"
      aria-label="Memuat konten..."
      className={`animate-pulse bg-surface-container-high shrink-0 ${variantStyles[variant || 'rectangular']} ${className}`.trim()}
      style={customStyles}
      {...props}
    />
  );
};
