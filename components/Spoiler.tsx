import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

interface SpoilerProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
}

const Spoiler: React.FC<SpoilerProps> = ({ 
  title, 
  children, 
  isOpen, 
  onToggle,
  className = "border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm",
  titleClassName = "font-medium text-slate-700 dark:text-slate-300",
  contentClassName = "p-4 border-t border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg",
  iconClassName = "w-5 h-5 text-slate-500 dark:text-slate-400"
}) => {
  const uniqueId = React.useId();
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 rounded-t-lg transition-colors duration-150"
        aria-expanded={isOpen}
        aria-controls={`spoiler-content-${uniqueId}`}
      >
        <span className={titleClassName}>{title}</span>
        {isOpen ? <ChevronUpIcon className={iconClassName} /> : <ChevronDownIcon className={iconClassName} />}
      </button>
      {isOpen && (
        <div 
          id={`spoiler-content-${uniqueId}`}
          className={contentClassName}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Spoiler;