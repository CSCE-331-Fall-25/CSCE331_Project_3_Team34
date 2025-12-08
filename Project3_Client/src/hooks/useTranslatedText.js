import { useContext, useEffect, useState } from 'react';
import { TranslationContext } from '../contexts/TranslationContext';

/**
 * Custom hook for translating UI text in components
 * Automatically re-translates when language changes
 * 
 * Usage:
 * const translatedLabel = useTranslatedText("Original text");
 * 
 * Or with array of texts:
 * const [texts, setTexts] = useTranslatedArray(["Text 1", "Text 2"]);
 */

export function useTranslatedText(text) {
  const context = useContext(TranslationContext);
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (!context || !text) {
      setTranslatedText(text);
      return;
    }

    if (context.selectedLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    // Trigger translation
    context.translate(text).then(result => {
      setTranslatedText(result);
    });
  }, [text, context?.selectedLanguage]);

  return translatedText;
}

/**
 * Hook for translating multiple texts at once
 * Returns an array of translated texts that updates when language changes
 */
export function useTranslatedArray(texts) {
  const context = useContext(TranslationContext);
  const [translatedTexts, setTranslatedTexts] = useState(texts);

  useEffect(() => {
    if (!context || !texts) {
      setTranslatedTexts(texts);
      return;
    }

    if (context.selectedLanguage === 'en') {
      setTranslatedTexts(texts);
      return;
    }

    // Translate all texts
    if (context.translateMultiple) {
      context.translateMultiple(texts).then(results => {
        setTranslatedTexts(results);
      });
    }
  }, [texts, context?.selectedLanguage]);

  return translatedTexts;
}

/**
 * Hook for translating object property values
 * Useful for translating button labels, headers, etc.
 * 
 * Usage:
 * const translatedObj = useTranslatedObject({
 *   title: "Menu",
 *   description: "Choose your items"
 * });
 */
export function useTranslatedObject(obj) {
  const context = useContext(TranslationContext);
  const [translatedObj, setTranslatedObj] = useState(obj);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!context || !obj || isTranslating) {
      return;
    }

    if (context.selectedLanguage === 'en') {
      setTranslatedObj(obj);
      return;
    }

    // Translate all values in the object
    const translateObject = async () => {
      setIsTranslating(true);
      const keys = Object.keys(obj);
      const values = keys.map(key => obj[key]);
      
      try {
        const translatedValues = await Promise.all(
          values.map(val => context.translate(val, context.selectedLanguage))
        );
        
        const result = {};
        keys.forEach((key, index) => {
          result[key] = translatedValues[index];
        });
        
        setTranslatedObj(result);
      } finally {
        setIsTranslating(false);
      }
    };

    translateObject();
  }, [context?.selectedLanguage]);

  return translatedObj;
}
