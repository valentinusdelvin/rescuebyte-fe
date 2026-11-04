import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const ariaDescribedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="w-full text-left font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-on-surface mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-outline">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={ariaDescribedBy}
            className={`w-full h-11 bg-white text-on-surface text-sm placeholder:text-outline/70 rounded-xl border transition-all duration-150 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-error focus:outline-hidden focus:border-error focus:ring-2 focus:ring-error/15'
                : 'border-outline-variant focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15'
            } disabled:bg-surface-container-low disabled:text-outline disabled:cursor-not-allowed ${className}`.trim()}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-outline">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-error flex items-center gap-1.5 mt-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {!error && hint && (
          <p id={hintId} className="text-xs text-on-surface-variant/80 mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
