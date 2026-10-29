import React from 'react';

const BADGE_VARIANTS = {
  success: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  emerald: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  warning: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  amber: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  danger: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  rose: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  black: 'bg-zinc-950 text-white border-zinc-950',
  dark: 'bg-zinc-900 text-zinc-100 border-zinc-900',
  info: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  blue: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  purple: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  neutral: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  slate: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  outline: 'bg-white text-zinc-800 border-zinc-200'
};

const BADGE_SIZES = {
  xs: 'px-1.5 py-0.5 text-[11px] rounded-sm gap-1',
  sm: 'px-2 py-0.5 text-xs rounded-md gap-1.5',
  md: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
  lg: 'px-3 py-1.5 text-sm rounded-md gap-2'
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  icon: Icon,
  dot = false,
  ...props
}) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;
  const sizeClass = BADGE_SIZES[size] || BADGE_SIZES.sm;

  return (
    <span
      className={`inline-flex items-center font-medium border select-none transition-colors ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            variant === 'success' || variant === 'emerald'
              ? 'bg-emerald-500'
              : variant === 'danger' || variant === 'rose'
              ? 'bg-rose-500'
              : variant === 'warning' || variant === 'amber'
              ? 'bg-amber-500'
              : variant === 'black'
              ? 'bg-zinc-400'
              : 'bg-zinc-400'
          }`}
        />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-zinc-500" strokeWidth={1.75} />}
      <span>{children}</span>
    </span>
  );
}
