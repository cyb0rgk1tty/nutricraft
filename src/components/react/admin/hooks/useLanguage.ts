/**
 * useLanguage Hook
 * React hook for i18n support in admin dashboard components.
 * Listens for language changes and forces re-render when language updates.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getLanguage,
  t as translate,
  getStageLabel as getStage,
  type Language,
  type TranslationKey
} from '../../../../utils/i18n';

/**
 * Hook for internationalization in React components
 *
 * @returns {object} Language utilities
 * - language: Current language code ('en' | 'zh')
 * - t: Translation function
 * - getStageLabel: Get translated stage label from CRM stage key
 *
 * @example
 * const { t, getStageLabel } = useLanguage();
 *
 * // Use in JSX
 * <button>{t('all')}</button>
 * <span>{getStageLabel('planning')}</span>
 */
export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    // Handle SSR - default to 'en' on server
    if (typeof window === 'undefined') return 'en';
    return getLanguage();
  });

  // Listen for language changes from LanguageSelector
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(getLanguage());
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // Translation function - memoized but depends on language
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      return translate(key, params);
    },
    [language] // Re-create when language changes to force consumers to re-render
  );

  // Get translated stage label
  const getStageLabel = useCallback(
    (stageKey: string): string => {
      return getStage(stageKey);
    },
    [language]
  );

  return { language, t, getStageLabel };
}

export default useLanguage;
