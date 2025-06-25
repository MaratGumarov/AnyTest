import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon, ChevronDownIcon } from './icons';
import { useConstants } from '../src/hooks/useConstants';
import { getTopicSuggestion } from '../services/geminiService';
import { debounce } from '../utils';

interface SmartTopicInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const SmartTopicInput: React.FC<SmartTopicInputProps> = ({ label, value, onChange }) => {
  const { t } = useTranslation();
  const { PREDEFINED_TOPICS } = useConstants();
  const topics = PREDEFINED_TOPICS.map(t => t.label).filter(t => t && t.trim() !== '');

  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSetSearch = useCallback(debounce(setDebouncedValue, 500), []);

  useEffect(() => {
    debouncedSetSearch(value);
  }, [value, debouncedSetSearch]);

  useEffect(() => {
    if (debouncedValue.length > 2) {
      const fetchSuggestion = async () => {
        setIsLoadingAiSuggestion(true);
        setAiSuggestions([]);
        const suggestions = await getTopicSuggestion(debouncedValue);
        if (Array.isArray(suggestions) && debouncedValue === value) {
          setAiSuggestions(suggestions);
        }
        setIsLoadingAiSuggestion(false);
      };
      fetchSuggestion();
    } else {
      setAiSuggestions([]);
    }
  }, [debouncedValue, value]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTopics = topics.filter(topic =>
    topic.toLowerCase().includes(value.toLowerCase())
  );

  // Typing animation effect for placeholder
  useEffect(() => {
    if (isFocused || value) {
      setCurrentPlaceholder(t('setup.customTopicPlaceholder'));
      return;
    }

    let typingTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      const targetPlaceholder = topics[placeholderIndex];
      if (!targetPlaceholder) {
        clearInterval(interval);
        return;
      }

      if (charIndex < targetPlaceholder.length) {
        setCurrentPlaceholder(prev => prev + targetPlaceholder[charIndex]);
        setCharIndex(charIndex + 1);
      } else {
        // Pause at the end of the line
        clearInterval(interval);
        typingTimeout = setTimeout(() => {
          setCharIndex(0);
          setCurrentPlaceholder('');
          setPlaceholderIndex(prevIndex => (prevIndex + 1) % topics.length);
        }, 2000);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [charIndex, isFocused, placeholderIndex, topics, value, t]);

  const handleSelectTopic = (topic: string) => {
    onChange(topic);
    setAiSuggestions([]);
    setIsFocused(false);
    setIsDropdownOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!isDropdownOpen && e.target.value) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (value || filteredTopics.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      inputRef.current?.focus();
    }
    setIsDropdownOpen(!isDropdownOpen);
    setIsFocused(!isDropdownOpen);
  };

  const hasResults = filteredTopics.length > 0 || aiSuggestions.length > 0 || isLoadingAiSuggestion;
  const showDropdown = isFocused && (isDropdownOpen || hasResults);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={currentPlaceholder}
            className="
              w-full px-4 py-3 pr-20 border rounded-xl transition-all duration-200
              bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm 
              text-slate-900 dark:text-slate-100
              border-slate-300 dark:border-slate-600
              hover:bg-white dark:hover:bg-slate-800 
              hover:border-slate-400 dark:hover:border-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              placeholder:text-slate-500 dark:placeholder:text-slate-400
            "
          />
          
          {/* Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-500" />
            <button
              type="button"
              onClick={toggleDropdown}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ChevronDownIcon 
                className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => {
              setIsDropdownOpen(false);
              setIsFocused(false);
            }} />
            
            {/* Menu */}
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in-down max-h-60 overflow-y-auto custom-scrollbar">
              {/* Loading AI suggestions */}
              {isLoadingAiSuggestion && (
                <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 flex items-center border-b border-slate-100 dark:border-slate-700">
                  <SparklesIcon className="w-4 h-4 mr-3 text-indigo-500 animate-pulse" />
                  <span>Loading AI suggestions...</span>
                </div>
              )}

              {/* AI Suggestions */}
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={`ai-${suggestion}-${index}`}
                  type="button"
                  onClick={() => handleSelectTopic(suggestion)}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-150 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <SparklesIcon className="w-4 h-4 mr-3 text-indigo-500 flex-shrink-0" />
                  <span className="flex-1 text-sm">{suggestion}</span>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 opacity-60" />
                </button>
              ))}

              {/* Separator between AI and predefined topics */}
              {aiSuggestions.length > 0 && filteredTopics.length > 0 && (
                <div className="px-4 py-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
                  Predefined topics
                </div>
              )}

              {/* Predefined Topics */}
              {filteredTopics.map((topic) => (
                <button
                  key={`topic-${topic}`}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-150 text-slate-700 dark:text-slate-300"
                >
                  <span className="flex-1 text-sm">{topic}</span>
                </button>
              ))}

              {/* No results */}
              {!hasResults && value && (
                <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {t('common.noResultsFound')}
                </div>
              )}

              {/* Start typing hint */}
              {!hasResults && !value && (
                <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {t('setup.startTypingToFilter')}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartTopicInput; 