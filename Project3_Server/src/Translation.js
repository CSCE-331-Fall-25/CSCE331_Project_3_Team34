import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Get the translation API key from .env file
const translateKey = process.env.translateKey;

if (!translateKey) {
  console.warn('Warning: translateKey not found in .env file. Translation service will be unavailable.');
}

/**
 * Translate text to a target language using Google Translate API
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'es', 'fr', 'de')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, targetLanguage) {
  console.log('[Translation Backend] Request:', { text, targetLanguage });
  
  if (!text) {
    console.log('[Translation Backend] Empty text, returning original');
    return text;
  }

  // If target is English or not specified, return original text
  if (targetLanguage === 'en' || !targetLanguage) {
    console.log('[Translation Backend] English or no language specified, returning original:', text);
    return text;
  }

  if (!translateKey) {
    console.error('[Translation Backend] API key missing - translation service unavailable');
    return text;
  }

  try {
    // Google Translate API v2 requires the API key as a URL parameter
    const url = `https://translation.googleapis.com/language/translate/v2?key=${translateKey}`;
    
    const requestBody = {
      q: text,
      target: targetLanguage,
    };
    
    console.log('[Translation Backend] Calling Google Translate API for:', { text, targetLanguage });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Translation Backend] API error response:', { status: response.status, body: errorBody });
      return text;
    }

    const data = await response.json();
    
    if (!data.data || !data.data.translations || !data.data.translations[0]) {
      console.error('[Translation Backend] Unexpected API response format:', data);
      return text;
    }

    const translatedText = data.data.translations[0].translatedText;
    console.log('[Translation Backend] Translation successful:', { originalText: text, translatedText, targetLanguage });
    return translatedText;
  } catch (error) {
    console.error('[Translation Backend] Error:', { text, targetLanguage, error: error.message });
    return text; // Return original text on error
  }
}

/**
 * Translate multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string[]>} - Array of translated texts
 */
export async function translateMultiple(texts, targetLanguage) {
  console.log('[Translation Backend] Multiple texts request:', { count: texts?.length, targetLanguage });
  
  if (!Array.isArray(texts) || texts.length === 0) {
    console.log('[Translation Backend] Empty or invalid text array, returning original');
    return texts;
  }

  if (targetLanguage === 'en' || !targetLanguage) {
    console.log('[Translation Backend] English or no language specified, returning originals');
    return texts;
  }

  if (!translateKey) {
    console.error('[Translation Backend] API key missing - translation service unavailable');
    return texts;
  }

  try {
    console.log('[Translation Backend] Calling Google Translate API for multiple texts:', { count: texts.length, targetLanguage });
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        target: targetLanguage,
        key: translateKey,
      }),
    });

    if (!response.ok) {
      console.error('[Translation Backend] API error:', { status: response.status, statusText: response.statusText });
      return texts;
    }

    const data = await response.json();
    
    if (!data.data || !data.data.translations) {
      console.error('[Translation Backend] Unexpected API response format:', data);
      return texts;
    }

    const translatedTexts = data.data.translations.map(item => item.translatedText);
    console.log('[Translation Backend] Multiple texts translation successful:', { count: translatedTexts.length, targetLanguage });
    return translatedTexts;
  } catch (error) {
    console.error('[Translation Backend] Error:', { count: texts.length, targetLanguage, error: error.message });
    return texts; // Return original texts on error
  }
}
