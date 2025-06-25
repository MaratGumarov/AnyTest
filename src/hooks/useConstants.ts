import { useTranslation } from 'react-i18next';
import { Difficulty } from '../../types';

export const CUSTOM_TOPIC_VALUE = 'CUSTOM_TOPIC_VALUE_INTERNAL';

export function useConstants() {
  const { t } = useTranslation();

  const DIFFICULTY_LEVELS = [
    { value: Difficulty.JUNIOR, label: t('difficulties.junior') },
    { value: Difficulty.MIDDLE, label: t('difficulties.middle') },
    { value: Difficulty.SENIOR, label: t('difficulties.senior') },
  ];

  const PREDEFINED_TOPICS = [
    { value: 'frontend', label: t('topics.frontend') },
    { value: 'backend', label: t('topics.backend') },
    { value: 'fullstack', label: t('topics.fullstack') },
    { value: 'devops', label: t('topics.devops') },
    { value: 'mobile', label: t('topics.mobile') },
    { value: 'data_science', label: t('topics.data_science') },
    { value: 'machine_learning', label: t('topics.machine_learning') },
    { value: 'product_management', label: t('topics.product_management') },
    { value: 'design', label: t('topics.design') },
    { value: 'qa', label: t('topics.qa') },
    { value: CUSTOM_TOPIC_VALUE, label: t('topics.custom') }
  ];

  return {
    DIFFICULTY_LEVELS,
    PREDEFINED_TOPICS,
    CUSTOM_TOPIC_VALUE,
  };
} 