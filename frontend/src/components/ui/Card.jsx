import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Tag = 'h3', ...props }) {
  return (
    <Tag className={`font-semibold text-zinc-950 tracking-tight text-sm sm:text-base ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-zinc-500 font-normal ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-3.5 sm:p-4 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
