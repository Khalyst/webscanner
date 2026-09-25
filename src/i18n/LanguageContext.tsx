import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  type SupportedLanguage,
  type TranslationDictionary,
  type LanguageOption,
  LANGUAGES,
  translations,
} from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  dir: 'ltr' | 'rtl';
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('webscanner_lang');
      if (saved && (saved in translations)) {
        return saved as SupportedLanguage;
      }
      // Check browser language
      const navLang = navigator.language.slice(0, 2);
      if (navLang in translations) {
        return navLang as SupportedLanguage;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('webscanner_lang', lang);
    } catch {
      // ignore
    }
  };

  const currentLangOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const dir = currentLangOption.dir;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language] || translations.en,
        dir,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
