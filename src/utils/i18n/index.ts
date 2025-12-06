/**
 * Dashboard Internationalization - Helper Functions
 * Provides translation utilities for the dashboard
 */

import { translations, stageToTranslationKey, stageOrder, type Language, type TranslationKey } from './translations';

const STORAGE_KEY = 'dashboard_language';
const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Get current language from localStorage or default to English
 */
export function getLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'zh') {
    return stored;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Set language and persist to localStorage
 * Dispatches 'languageChanged' event for components to react
 */
export function setLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Get translation by key with optional parameter interpolation
 *
 * @param key - Translation key
 * @param params - Optional parameters for interpolation (e.g., { n: 5 } for "{n} days ago")
 * @returns Translated string
 *
 * @example
 * t('daysAgo', { n: 5 }) // "5 days ago" or "5 天前"
 * t('confirmDelete', { filename: 'doc.pdf' }) // "Are you sure you want to delete "doc.pdf"?"
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = getLanguage();
  let text = translations[lang][key] || translations.en[key] || String(key);

  // Handle interpolation (e.g., "{n} days ago" -> "5 days ago")
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return text;
}

/**
 * Get all translations for current language
 * Useful for bulk operations or passing to components
 */
export function getTranslations(): typeof translations.en {
  const lang = getLanguage();
  return translations[lang];
}

/**
 * Get translated stage label from CRM stage key
 *
 * @param stageKey - CRM stage key (e.g., 'planning', 'order_samples')
 * @returns Translated stage label
 */
export function getStageLabel(stageKey: string): string {
  const translationKey = stageToTranslationKey[stageKey];
  if (translationKey) {
    return t(translationKey);
  }
  return t('unknown');
}

/**
 * Format a relative date with translations
 *
 * @param date - Date to format
 * @returns Translated relative date string
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('today');
  if (diffDays === 1) return t('yesterday');
  if (diffDays < 7) return t('daysAgo', { n: diffDays });
  if (diffDays < 30) return t('weeksAgo', { n: Math.floor(diffDays / 7) });

  // For older dates, use locale-aware formatting
  const lang = getLanguage();
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/**
 * Format relative time for sync status
 *
 * @param date - Date to format
 * @returns Translated relative time string (e.g., "5m ago", "2h ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return t('justNow');
  if (diffMinutes < 60) return t('minutesAgo', { n: diffMinutes });
  if (diffHours < 24) return t('hoursAgo', { n: diffHours });
  return t('daysAgoShort', { n: diffDays });
}

// Re-export types and constants for convenience
export { translations, stageToTranslationKey, stageOrder, type Language, type TranslationKey };
