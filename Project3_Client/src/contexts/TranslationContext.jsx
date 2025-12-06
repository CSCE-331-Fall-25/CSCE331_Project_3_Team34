import React, { createContext, useState, useCallback } from 'react';

export const TranslationContext = createContext();

const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
};

export function TranslationProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const getCacheKey = (text, targetLang) => {
    return `${text}|${targetLang}`;
  };

  const translate = useCallback(async (text, targetLanguage = selectedLanguage) => {
    // If target is English, return original text
    if (targetLanguage === 'en' || !text) {
      return text;
    }

    const cacheKey = getCacheKey(text, targetLanguage);
    
    // Check cache first
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      setIsTranslating(true);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        console.error('Translation failed:', response.statusText);
        return text;
      }

      const data = await response.json();
      const translatedText = data.translatedText || text;

      // Update cache
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText,
      }));

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [selectedLanguage, translationCache]);

  const translateMultiple = useCallback(async (texts, targetLanguage = selectedLanguage) => {
    if (!Array.isArray(texts)) {
      return texts;
    }

    if (targetLanguage === 'en') {
      return texts;
    }

    // Translate all texts in parallel
    const translatedResults = await Promise.all(
      texts.map(text => translate(text, targetLanguage))
    );

    return translatedResults;
  }, [selectedLanguage, translate]);

  const value = {
    selectedLanguage,
    setSelectedLanguage,
    translate,
    translateMultiple,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isTranslating,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
