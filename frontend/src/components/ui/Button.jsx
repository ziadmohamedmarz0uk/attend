import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-zinc-950 hover:bg-zinc-800 text-white border-zinc-950 shadow-xs',
  emerald: 'bg-zinc-950 hover:bg-zinc-800 text-white border-zinc-950 shadow-xs',
  secondary: 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border-zinc-200',
  outline: 'bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-zinc-300 shadow-xs',
  danger: 'bg-zinc-950 hover:bg-zinc-800 text-white border-zinc-950 shadow-xs',
  dangerOutline: 'bg-white hover:bg-rose-50/60 text-rose-600 border-zinc-200 hover:border-rose-200',
  ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-700 border-transparent',
  subtle: 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
};

const SIZES = {
  xs: 'px-2 py-1 text-xs rounded-md gap-1.5',
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm rounded-md gap-2',
  lg: 'px-4.5 py-2.5 text-sm sm:text-base rounded-md gap-2.5',
  icon: 'p-2 rounded-md'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium border transition-colors duration-150 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0 text-current" strokeWidth={1.75} />}
          {children}
        </>
      )}
    </button>
  );
}
