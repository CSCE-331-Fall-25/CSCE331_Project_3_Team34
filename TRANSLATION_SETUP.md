# Google Translate Setup for Kiosk Screen

## Overview
This implementation adds multi-language support to your kiosk system using Google Translate. Users can select a language on the weather screen, and all text on the kiosk will be translated accordingly.

## What's Been Implemented

### Frontend Changes (Project3_Client)

1. **TranslationContext.jsx** (`src/contexts/TranslationContext.jsx`)
   - Global React Context to manage selected language state
   - Translation caching to improve performance
   - Supports 11 languages: English, Spanish, French, German, Chinese, Japanese, Korean, Portuguese, Russian, and Arabic

2. **useTranslate Hook** (`src/hooks/useTranslate.js`)
   - Custom React hook to use translation functionality in any component
   - Provides `translate()`, `translateAsync()`, and `translateMultiple()` functions
   - Handles translation state and caching

3. **TranslationClient Component** (`src/Components/TranslationClient.jsx`)
   - Dropdown UI component for language selection
   - Allows users to switch languages on the fly

4. **TranslationClient Styles** (`src/styles/TranslationClient.css`)
   - Professional styling for the language selector
   - Hover and focus states for better UX

5. **Updated WeatherScreen** (`src/pages/WeatherScreen.jsx`)
   - Added language selector dropdown
   - Positioned in top-right corner of screen

6. **Updated App.jsx** (`src/App.jsx`)
   - Wrapped entire app with `TranslationProvider`
   - All routes now have access to translation context

7. **Updated package.json**
   - Added `google-translate-api-x` dependency

### Backend Changes (Project3_Server)

1. **Translation.js** (`src/Translation.js`)
   - Core translation logic using Google Cloud Translate API
   - `translateText()` - translates single text
   - `translateMultiple()` - translates multiple texts at once
   - Includes error handling and fallbacks

2. **Updated index.js** (`src/index.js`)
   - Added import for Translation module
   - New `/api/translate` POST endpoint
   - Accepts `{ text, targetLanguage }` and returns `{ translatedText }`

3. **Updated package.json**
   - Added `@google-cloud/translate` dependency

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
cd Project3_Client
npm install
```

**Backend:**
```bash
cd Project3_Server
npm install
```

### 2. Google Translate API Setup (Required for Translation)

The translation system uses the `translateKey` from your `.env` file:

**Your `.env` file already has:**
```
translateKey = AIzaSyAl24SqW8IU-vo3zAHSUaTluvNbG4a_pd0
```

**If you need to update or get a new API key:**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select or Create a Project:**
   - Click "Select a Project" → "New Project"
   - Name it "Panda Express Kiosk" (or similar)
   - Click "Create"

3. **Enable Google Translate API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Translate API"
   - Click on it
   - Click "Enable"

4. **Create an API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

5. **Update your `.env` file:**
   - Open `Project3_Server/src/.env`
   - Update or add: `translateKey = YOUR_API_KEY_HERE`
   - Replace `YOUR_API_KEY_HERE` with your actual API key
   - Save the file

**For Production (Render):**
   - Add `translateKey` as an environment variable in your Render dashboard
   - Set it to your Google Translate API key

### 3. Using Translations in Components

To use translations in any React component:

```jsx
import { useTranslate } from '../hooks/useTranslate';

export default function MyComponent() {
  const { translate, selectedLanguage } = useTranslate();
  
  // Simple usage (returns cached/original text)
  const label = translate("Click here");
  
  // Async usage for immediate translation
  const [translatedText, setTranslatedText] = useState("");
  
  useEffect(() => {
    translate("Click here").then(text => setTranslatedText(text));
  }, []);
  
  return <div>{translatedText}</div>;
}
```

## How It Works

1. **User Selection**: User selects language on weather screen
2. **Context Update**: `TranslationContext` updates `selectedLanguage` state
3. **Component Updates**: All components using `useTranslate()` hook can access the selected language
4. **Translation Flow**:
   - Component requests translation via `useTranslate()`
   - Hook sends request to `/api/translate` backend endpoint
   - Backend uses Google Cloud Translate API
   - Result is cached on frontend to avoid duplicate requests
   - Component renders translated text

## Language Codes Supported

- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `zh` - Chinese (Simplified)
- `ja` - Japanese
- `ko` - Korean
- `pt` - Portuguese
- `ru` - Russian
- `ar` - Arabic

## Next Steps for Full Integration

To translate all Kiosk text, you'll need to:

1. **Update Kiosk.jsx**:
   - Wrap all user-facing text with `translate()` calls
   - Use effect to trigger translations when language changes
   - Example: `const menuLabel = translate("Menu")`

2. **Update Other Components**:
   - Import and use `useTranslate` hook in Menu, Kitchen, etc.
   - Wrap JSX text with translation calls

3. **Dynamic Content**:
   - For database content (menu items, prices), translate on display:
     ```jsx
     const translatedMenuItems = await Promise.all(
       menuItems.map(item => translate(item.name))
     );
     ```

## Troubleshooting

### "Translation service is not available"
- Check that `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
- Verify the credentials JSON file path is correct
- Ensure Cloud Translation API is enabled in Google Cloud Console

### Translation endpoint returns 500 error
- Check server console for detailed error messages
- Verify your Google Cloud credentials have Translation API permissions
- Ensure your Google Cloud project ID is correct

### No translations appearing
- Open browser DevTools and check Network tab
- Verify `/api/translate` requests are being made
- Check that the response contains `translatedText`
- Ensure component is properly using the `useTranslate` hook

## Performance Considerations

- **Caching**: Translations are cached on the frontend to avoid redundant API calls
- **Backend Limits**: Google Cloud Translate has quotas - monitor usage in Cloud Console
- **Batch Translations**: Use `translateMultiple()` for multiple strings to be more efficient

## Security Notes

- Never commit your Google Cloud credentials JSON to version control
- Use `.gitignore` to exclude credential files
- In production, use environment variables or secrets management
- Render allows setting sensitive environment variables securely

## Future Enhancements

- Add auto-detection of user's preferred language
- Implement language persistence in localStorage
- Add language selection to other screens (Cashier, Manager, etc.)
- Create a language preferences user setting in the database
