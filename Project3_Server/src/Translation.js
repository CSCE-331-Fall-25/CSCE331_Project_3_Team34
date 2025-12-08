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
  if (!text) {
    return text;
  }

  // If target is English or not specified, return original text
  if (targetLanguage === 'en' || !targetLanguage) {
    return text;
  }

  if (!translateKey) {
    console.warn('Translation service is not available - API key missing');
    return text;
  }

  console.log('🔑 API Key loaded:', translateKey ? `${translateKey.substring(0, 10)}...` : 'MISSING');
  console.log('📝 Translating:', text.substring(0, 50), 'to', targetLanguage);

  try {
    // Google Translate API v2 requires the API key as a URL parameter
    const url = `https://translation.googleapis.com/language/translate/v2?key=${translateKey}`;
    
    const requestBody = {
      q: text,
      target: targetLanguage,
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Translation API error:', response.statusText);
      console.error('❌ Error details:', errorBody);
      return text;
    }

    const data = await response.json();
    
    if (!data.data || !data.data.translations || !data.data.translations[0]) {
      console.error('Unexpected translation API response format');
      return text;
    }

    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error.message);
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
  if (!Array.isArray(texts) || texts.length === 0) {
    return texts;
  }

  if (targetLanguage === 'en' || !targetLanguage) {
    return texts;
  }

  if (!translateKey) {
    console.warn('Translation service is not available - API key missing');
    return texts;
  }

  try {
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
      console.error('Translation API error:', response.statusText);
      return texts;
    }

    const data = await response.json();
    
    if (!data.data || !data.data.translations) {
      console.error('Unexpected translation API response format');
      return texts;
    }

    return data.data.translations.map(item => item.translatedText);
  } catch (error) {
    console.error('Translation error:', error.message);
    return texts; // Return original texts on error
  }
}
