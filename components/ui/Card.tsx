import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  rounded = 'xl',
  interactive = false,
}) => {
  const baseClasses = 'transition-all duration-200';
  
  const variants = {
    default: 'bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600/50',
    glass: 'glass-effect backdrop-blur-20 dark:border-purple-500/20'
  };
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md hover:shadow-lg',
    lg: 'shadow-lg hover:shadow-xl',
    xl: 'shadow-xl hover:shadow-2xl'
  };
  
  const roundings = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };
  
  const interactiveClasses = interactive ? 'hover-lift cursor-pointer' : '';
  
  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${paddings[padding]}
    ${shadows[shadow]}
    ${roundings[rounded]}
    ${interactiveClasses}
    ${className}
  `.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card; 