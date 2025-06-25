import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons';

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  error,
  options,
  value,
  onChange,
  placeholder,
  fullWidth = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = options.find(option => option.value === value);
  const displayValue = currentOption?.label || placeholder || 'Select...';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const baseClasses = `
    px-4 py-3 border rounded-xl transition-all duration-200 
    cursor-pointer flex items-center justify-between
    bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm 
    text-slate-900 dark:text-slate-100
    border-slate-300 dark:border-slate-600
    hover:bg-white dark:hover:bg-slate-800 
    hover:border-slate-400 dark:hover:border-slate-500
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          className={baseClasses}
        >
          <span className={currentOption ? '' : 'text-slate-500 dark:text-slate-400'}>
            {displayValue}
          </span>
          <ChevronDownIcon 
            className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Menu */}
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in-down">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-150 ${
                    option.value === value 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </>
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

export default CustomSelect; 