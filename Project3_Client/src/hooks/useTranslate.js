import { useContext, useState, useEffect } from 'react';
import { TranslationContext } from '../contexts/TranslationContext';

/**
 * Hook to handle text translation
 * Usage: const translatedText = useTranslate("Original text");
 */
export function useTranslate() {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslate must be used within TranslationProvider');
  }

  const { translate, selectedLanguage, isTranslating } = context;
  const [translatedCache, setTranslatedCache] = useState({});

  // Translate text when language changes or when a new piece of text is passed
  const getTranslation = (text) => {
    if (!text || selectedLanguage === 'en') {
      return text;
    }

    if (translatedCache[text]) {
      return translatedCache[text];
    }

    // Return the original text while translation is in progress
    return text;
  };

  // Function to translate multiple texts at once
  const translateMultiple = async (texts) => {
    if (!Array.isArray(texts)) {
      return texts;
    }

    const promises = texts.map(text => translate(text));
    return Promise.all(promises);
  };

  // Function to translate a single piece of text with async support
  const translateAsync = async (text) => {
    return translate(text);
  };

  return {
    translate: getTranslation,
    translateAsync,
    translateMultiple,
    selectedLanguage,
    isTranslating,
  };
}
