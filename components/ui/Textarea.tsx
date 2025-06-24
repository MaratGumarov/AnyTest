import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'modern';
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  variant = 'default',
  fullWidth = true,
  resize = 'none',
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 custom-scrollbar';
  
  const variants = {
    default: 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-indigo-500',
    modern: 'border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:ring-indigo-500 input-modern'
  };
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const fullWidthClasses = fullWidth ? 'w-full' : '';
  
  const textareaClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${resizeClasses[resize]}
    ${errorClasses}
    ${fullWidthClasses}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
          {error}
        </p>
      )}
    </div>
  );
});

export default Textarea; 