import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'modern';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'default',
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500';
  
  const variants = {
    default: 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-indigo-500',
    modern: 'border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:ring-indigo-500 input-modern'
  };
  
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const fullWidthClasses = fullWidth ? 'w-full' : '';
  
  const inputClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${errorClasses}
    ${fullWidthClasses}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input; 