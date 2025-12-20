import { useI18nStore } from '@/stores/useI18nStore';
import { dictionary } from '@/app/lib/i18n/dictionary';

export function useTranslation() {
  const { lang } = useI18nStore();
  // Return the dictionary for the current language. 
  // We use type assertion or check to ensure type safety if needed, 
  // but for now simple access is enough.
  return dictionary[lang as keyof typeof dictionary] || dictionary.pt;
}
