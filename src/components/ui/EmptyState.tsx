import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }> | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent = PackageSearch,
  title,
  description,
  action,
  className = '',
}) => {
  const renderIcon = () => {
    if (!IconComponent) return null;
    if (React.isValidElement(IconComponent)) {
      return IconComponent;
    }
    const Comp = IconComponent as React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
    return <Comp className="w-7 h-7 text-outline" aria-hidden="true" />;
  };

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-8 text-center font-sans ${className}`.trim()}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/60 flex items-center justify-center mb-3.5 shrink-0 shadow-xs">
        {renderIcon()}
      </div>

      <h4 className="text-base font-bold font-heading text-on-surface mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-xs sm:text-sm text-on-surface-variant/80 max-w-sm leading-relaxed mb-5">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="sm"
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
