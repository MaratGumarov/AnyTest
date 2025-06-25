import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './ui';
import { SparklesIcon } from './icons';
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
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  
  const [debouncedValue, setDebouncedValue] = useState(value);

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
  }, [charIndex, isFocused, placeholderIndex, topics, value]);

  const handleSelectTopic = (topic: string) => {
    onChange(topic);
    setAiSuggestions([]);
  };


  return (
    <div className="relative">
      <Input
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={currentPlaceholder}
        variant="modern"
        rightIcon={<SparklesIcon className="w-5 h-5 text-indigo-500" />}
      />
      {isFocused && (value || filteredTopics.length > 0 || aiSuggestions.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul>
            {isLoadingAiSuggestion && (
                 <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-2 text-indigo-500 animate-pulse" />
                    <span>Loading AI suggestions...</span>
                 </li>
            )}
            {aiSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
                onMouseDown={() => handleSelectTopic(suggestion)}
              >
                <SparklesIcon className="w-4 h-4 mr-2 text-indigo-500" />
                <span>{suggestion}</span>
              </li>
            ))}

            {filteredTopics.map((topic) => (
              <li
                key={topic}
                className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                onMouseDown={() => handleSelectTopic(topic)}
              >
                {topic}
              </li>
            ))}
            {filteredTopics.length === 0 && aiSuggestions.length === 0 && value && !isLoadingAiSuggestion && (
              <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                {t('common.noResultsFound')}
              </li>
            )}
             {filteredTopics.length === 0 && !value && (
                 <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                    {t('setup.startTypingToFilter')}
                 </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartTopicInput; 