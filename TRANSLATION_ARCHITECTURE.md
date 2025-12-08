# Translation System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE FLOW                         │
└─────────────────────────────────────────────────────────────────┘

WeatherScreen (Idle Screen)
    ↓
    └─→ [Language Selector Dropdown] ← TranslationClient Component
        ├─ English
        ├─ Spanish
        ├─ French
        ├─ German
        ├─ Chinese
        ├─ Japanese
        ├─ Korean
        ├─ Portuguese
        ├─ Russian
        └─ Arabic
        
        User selects language → Updates TranslationContext
                                ↓
                        selectedLanguage = "es" (for example)


┌─────────────────────────────────────────────────────────────────┐
│                   REACT COMPONENT FLOW                          │
└─────────────────────────────────────────────────────────────────┘

App.jsx
  ↓
[TranslationProvider]
  ↓ (provides context)
  ├─ WeatherScreen
  │   └─ TranslationClient (can change language)
  │
  ├─ Kiosk
  │   ├─ useTranslatedText("Tap To Start") → "Toca para empezar"
  │   ├─ useTranslatedArray(["Menu", "Checkout"]) → ["Menú", "Pagar"]
  │   └─ useTranslatedObject({ title: "Menu" }) → { title: "Menú" }
  │
  ├─ Menu
  │   └─ Can use all translation hooks
  │
  ├─ Kitchen
  │   └─ Can use all translation hooks
  │
  └─ Other Pages
      └─ Can use all translation hooks


┌─────────────────────────────────────────────────────────────────┐
│                  TRANSLATION CONTEXT FLOW                       │
└─────────────────────────────────────────────────────────────────┘

TranslationContext
├─ State:
│  ├─ selectedLanguage (currently selected language code)
│  ├─ translationCache (stores translated strings)
│  └─ isTranslating (loading state)
│
├─ Methods:
│  ├─ translate(text) → returns translated text
│  ├─ translateMultiple(texts[]) → returns array of translations
│  └─ setSelectedLanguage(code) → updates language selection
│
└─ Provides to all child components via Context


┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HOOKS AVAILABLE                    │
└─────────────────────────────────────────────────────────────────┘

1. useTranslate()
   ├─ Direct access to translate function
   ├─ Use for: manual translation control
   └─ Returns: { translate, selectedLanguage, isTranslating }

2. useTranslatedText(text)
   ├─ Auto-translates single text
   ├─ Re-translates when language changes
   └─ Returns: translated text string

3. useTranslatedArray(texts[])
   ├─ Auto-translates array of texts
   ├─ Re-translates when language changes
   └─ Returns: array of translated strings

4. useTranslatedObject(object)
   ├─ Auto-translates object property values
   ├─ Re-translates when language changes
   └─ Returns: object with translated values


┌─────────────────────────────────────────────────────────────────┐
│                  API & BACKEND FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Frontend Component
    │
    ├─ User sees text: "Add to Order"
    ├─ Language is: "es" (Spanish)
    └─ Calls: useTranslatedText("Add to Order")
        ↓
    TranslationContext
    ├─ Checks cache for "Add to Order|es"
    ├─ Cache miss, so makes API request
    └─ Sends POST to /api/translate
        │
        │ Request Body:
        │ {
        │   "text": "Add to Order",
        │   "targetLanguage": "es"
        │ }
        ↓
    Server (Express)
        │
        ├─ Receives /api/translate POST
        ├─ Extracts text and targetLanguage
        └─ Calls translateText() from Translation.js
            ↓
        Translation.js
        ├─ Uses @google-cloud/translate library
        ├─ Sends request to Google Translate API
        └─ Google Cloud returns translation
            │
            │ Response: "Añadir al pedido"
            ↓
        Express Server
        └─ Returns JSON response
            │
            │ Response Body:
            │ {
            │   "translatedText": "Añadir al pedido"
            │ }
            ↓
    Frontend
    ├─ Receives translation
    ├─ Caches it: cache["Add to Order|es"] = "Añadir al pedido"
    ├─ Returns translated text
    └─ Component renders: "Añadir al pedido"


┌─────────────────────────────────────────────────────────────────┐
│                    LANGUAGE CHANGE FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User selects "French" in language dropdown
        ↓
TranslationClient triggers onChange
        ↓
Calls: setSelectedLanguage("fr")
        ↓
TranslationContext updates state
        ↓
All components using useTranslatedText/Array/Object
get their effect triggered (selectedLanguage changed)
        ↓
Each component makes new /api/translate requests
        ↓
All translations updated to French
        ↓
Components re-render with French text


┌─────────────────────────────────────────────────────────────────┐
│                    CACHING MECHANISM                            │
└─────────────────────────────────────────────────────────────────┘

Translation Cache Structure:
{
  "Add to Order|es": "Añadir al pedido",
  "Add to Order|fr": "Ajouter à la commande",
  "Quantity|es": "Cantidad",
  "Quantity|fr": "Quantité",
  "Menu|es": "Menú",
  "Menu|fr": "Menu",
  ...
}

When text is requested for translation:
1. Generate cache key: text + "|" + targetLanguage
2. Check if key exists in cache
3. If yes → return cached translation immediately
4. If no → make API request
5. Store result in cache
6. Return translation

Benefits:
✓ Faster subsequent translations
✓ Reduced API calls
✓ Lower costs
✓ Better user experience


┌─────────────────────────────────────────────────────────────────┐
│                  ERROR HANDLING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

If Translation Fails:
    ↓
Original English text is returned
    ↓
Component displays English version
    ↓
Error logged to console
    ↓
User continues without interruption

Possible Error Scenarios:
1. Invalid language code → returns original text
2. API unreachable → returns original text
3. Empty or null text → returns as-is
4. Google Cloud credentials not set → returns original text
5. Translation API quota exceeded → returns original text


┌─────────────────────────────────────────────────────────────────┐
│                  FILE STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────┘

Project3_Client/
├── src/
│   ├── contexts/
│   │   └── TranslationContext.jsx         [Global Translation State]
│   ├── hooks/
│   │   ├── useTranslate.js                [Direct Translation Hook]
│   │   └── useTranslatedText.js           [Auto-Translation Hooks]
│   ├── Components/
│   │   └── TranslationClient.jsx          [Language Selector UI]
│   ├── styles/
│   │   └── TranslationClient.css          [Styling]
│   ├── pages/
│   │   ├── WeatherScreen.jsx              [Updated: Language Selector]
│   │   └── Kiosk.jsx                      [To be updated]
│   └── App.jsx                            [Updated: TranslationProvider]
│
Project3_Server/
├── src/
│   ├── Translation.js                     [Google Translate Wrapper]
│   └── index.js                           [Updated: /api/translate endpoint]
│
Documentation/
├── TRANSLATION_SETUP.md                   [Setup Instructions]
├── TRANSLATION_QUICK_REFERENCE.md         [Quick Reference]
├── KIOSK_TRANSLATION_GUIDE.md             [Implementation Guide]
└── PROJECT3_TRANSLATION_EXAMPLES.md       [Code Examples]


┌─────────────────────────────────────────────────────────────────┐
│                SUPPORTED LANGUAGE CODES                         │
└─────────────────────────────────────────────────────────────────┘

en  - English (Default)
es  - Spanish (Español)
fr  - French (Français)
de  - German (Deutsch)
zh  - Chinese (中文)
ja  - Japanese (日本語)
ko  - Korean (한국어)
pt  - Portuguese (Português)
ru  - Russian (Русский)
ar  - Arabic (العربية)


┌─────────────────────────────────────────────────────────────────┐
│                 DEPLOYMENT CONSIDERATIONS                       │
└─────────────────────────────────────────────────────────────────┘

Local Development:
✓ Set GOOGLE_APPLICATION_CREDENTIALS to JSON file path
✓ Credentials file contains all necessary information
✓ Easy to test and debug

Production (Render):
✓ Cannot store large JSON files as env vars directly
✓ Options:
  1. Use base64 encoding of JSON
  2. Store in secret manager
  3. Use workload identity if using GCP
  4. Use environment-specific credentials

Setup for Render:
1. Encode credentials: cat credentials.json | base64 > encoded.txt
2. Add GOOGLE_CREDENTIALS_BASE64 env var in Render dashboard
3. In server code, decode at startup:
   const credentials = JSON.parse(
     Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString()
   );


┌─────────────────────────────────────────────────────────────────┐
│              PERFORMANCE OPTIMIZATION                           │
└─────────────────────────────────────────────────────────────────┘

Current Optimizations:
✓ Caching prevents duplicate API calls
✓ Context prevents prop drilling
✓ Batch translation with translateMultiple()
✓ Error fallback avoids breaking UI

Potential Future Improvements:
• Add localStorage persistence for user's language choice
• Pre-cache common phrases on app start
• Implement translation memory (database)
• Use service workers to cache translations offline
• Implement CDN for faster API responses
• Add language-specific fonts for better rendering
