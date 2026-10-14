import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border border-blue-600 shadow-xs focus:ring-2 focus:ring-blue-500/20',
    secondary:
      'bg-white hover:bg-[#F8FAFC] active:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] shadow-xs focus:ring-2 focus:ring-blue-500/20',
    outline:
      'bg-white hover:bg-[#F8FAFC] active:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] shadow-xs focus:ring-2 focus:ring-blue-500/20',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border border-rose-600 shadow-xs focus:ring-2 focus:ring-rose-500/20',
    ghost:
      'bg-transparent hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] focus:ring-2 focus:ring-blue-500/20',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
