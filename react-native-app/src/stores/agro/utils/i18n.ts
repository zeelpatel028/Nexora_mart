import { create } from './state';
import { translations, LanguageCode } from './translations';
import storage from '../../../api/storage';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const useLanguage = create<LanguageState>((set, get) => ({
  language: 'en',
  setLanguage: (lang: LanguageCode) => {
    set({ language: lang });
    try {
      storage.setItem('user_language', lang);
    } catch {}
  },
  t: (key: keyof typeof translations['en']) => {
    const lang = get().language;
    const currentDict = translations[lang] || translations.en;
    return (currentDict[key] || translations.en[key] || key) as string;
  },
}));

export * from './translations';
