import React from 'react';
import { ChevronDownIcon } from '../icons';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'modern';
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  variant = 'default',
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'px-4 py-3 pr-10 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent appearance-none cursor-pointer';
  
  const variants = {
    default: 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-indigo-500',
    modern: 'border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:ring-indigo-500 input-modern'
  };
  
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const fullWidthClasses = fullWidth ? 'w-full' : '';
  
  const selectClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${errorClasses}
    ${fullWidthClasses}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select; 