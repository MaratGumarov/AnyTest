import React from 'react';
import { LoadingSpinner } from '../icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-modern';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 hover-lift active-press dark:bg-gradient-to-r dark:from-purple-600 dark:to-violet-600 dark:hover:from-purple-700 dark:hover:to-violet-700',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-500 dark:bg-gradient-to-r dark:from-slate-700 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500 dark:text-slate-100',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 hover-lift active-press dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:focus:ring-emerald-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 hover-lift active-press dark:bg-gradient-to-r dark:from-rose-500 dark:to-pink-500 dark:hover:from-rose-600 dark:hover:to-pink-600 dark:focus:ring-rose-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-800 focus:ring-slate-500 dark:hover:bg-gradient-to-r dark:hover:from-purple-800/20 dark:hover:to-violet-800/20 dark:text-slate-300 dark:hover:text-purple-200'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner className="w-4 h-4 mr-2" />
      ) : leftIcon ? (
        <span className="mr-2 flex-shrink-0">{leftIcon}</span>
      ) : null}
      
      <span className="flex-1">{children}</span>
      
      {!isLoading && rightIcon && (
        <span className="ml-2 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button; 