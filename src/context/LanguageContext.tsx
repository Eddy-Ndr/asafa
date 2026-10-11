import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types.ts';
import { translations } from '../i18n/translations.ts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.fr, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('asafa_language');
    return (saved as Language) || 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('asafa_language', lang);
  };

  const t = (key: keyof typeof translations.fr, fallback?: string): string => {
    const langDict = translations[language] || translations.fr;
    return (langDict as any)[key] || (translations.fr as any)[key] || fallback || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
