import { Difficulty } from './types';

export const APP_TITLE = "AI Interview Coach";
export const DEFAULT_DIFFICULTY = Difficulty.MIDDLE;

export const DIFFICULTY_LEVELS = [
  { value: Difficulty.JUNIOR, label: 'Junior (Джуниор)' },
  { value: Difficulty.MIDDLE, label: 'Middle (Мидл)' },
  { value: Difficulty.SENIOR, label: 'Senior (Сеньор)' },
];

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const CUSTOM_TOPIC_VALUE = 'CUSTOM_TOPIC_VALUE_INTERNAL'; // Internal value to identify custom topic choice

export const PREDEFINED_TOPICS = [
  { value: 'Java', label: 'Java' },
  { value: 'Python', label: 'Python' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Алгоритмы и структуры данных', label: 'Алгоритмы и структуры данных' },
  { value: 'Базы данных SQL', label: 'Базы данных (SQL)' },
  { value: 'Теория тестирования ПО', label: 'Теория тестирования ПО'},
  { value: 'Frontend Development', label: 'Frontend разработка' },
  { value: 'Backend Development', label: 'Backend разработка' },
  { value: CUSTOM_TOPIC_VALUE, label: 'Другая тема (указать свою)...' }
];

export const DEFAULT_TOPIC_PREDEFINED = PREDEFINED_TOPICS[0].value;

// Screen constants
export const SCREEN_SETUP = 'setup';
export const SCREEN_QUESTIONS = 'questions';
export const SCREEN_SUMMARY = 'summary';

// Question batching
export const QUESTION_BATCH_SIZE = 7; // Number of questions to fetch per batch
export const PRELOAD_THRESHOLD = 3;   // When N questions are left, preload next batch

export const APP_MOTTO = "Ваш ИИ-тренер для подготовки к собеседованиям";