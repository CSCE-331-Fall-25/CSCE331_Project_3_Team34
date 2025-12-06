# Implementation Checklist

## ✅ What's Been Done

- [x] Created `TranslationContext.jsx` for global state management
- [x] Created `useTranslate.js` hook for basic translation
- [x] Created `useTranslatedText.js` with advanced hooks
- [x] Created `TranslationClient.jsx` language selector component
- [x] Created `TranslationClient.css` styling
- [x] Updated `WeatherScreen.jsx` with language selector
- [x] Updated `App.jsx` to wrap with TranslationProvider
- [x] Created `Translation.js` backend module
- [x] Updated `index.js` with `/api/translate` endpoint
- [x] Updated client `package.json` with dependencies
- [x] Updated server `package.json` with dependencies
- [x] Created comprehensive documentation

## 🚀 Next Steps (Your Action Items)

### 1. Install Dependencies

**Priority: CRITICAL**
```bash
# Frontend
cd Project3_Client
npm install

# Backend
cd ../Project3_Server
npm install
```

### 2. Set Up Google Cloud

**Priority: CRITICAL**

Follow these detailed steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a Project" → "New Project"
   - Name: "Panda Express Kiosk" (or similar)
   - Click "Create"
   - Wait for project to be created

3. **Enable Cloud Translation API**
   - Search for "Cloud Translation API"
   - Click on it
   - Click "Enable"
   - Wait for it to be enabled

4. **Create Service Account**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Service account name: "panda-kiosk-translator"
   - Click "Create and Continue"
   - Click "Continue" (on the next page)
   - Click "Done"

5. **Create and Download Keys**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Click "Create"
   - A JSON file will download automatically
   - **Keep this file safe and secure!**

6. **Set Environment Variable**
   - Put the downloaded JSON file somewhere safe, like: `C:\credentials\panda-kiosk-key.json`
   - Set the environment variable:
     ```powershell
     $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\credentials\panda-kiosk-key.json"
     ```
   - You may need to restart your terminal or IDE for this to take effect

### 3. Test the Translation API

**Priority: HIGH**

```bash
# Start the backend server
cd Project3_Server
npm start

# In another terminal, start the frontend
cd Project3_Client
npm run dev

# Navigate to http://localhost:5173/weather
# You should see language selector in top-right
# Try selecting Spanish or another language
```

### 4. Update Kiosk.jsx with Translations

**Priority: HIGH**

See `KIOSK_TRANSLATION_GUIDE.md` for detailed instructions on:
- Adding imports
- Using translation hooks
- Translating menu items
- Translating buttons and labels
- Translating dynamic content

**Quick summary:**
```jsx
// Add at top
import { useTranslatedText } from '../hooks/useTranslatedText';

// In component
const welcomeText = useTranslatedText("Welcome");

// In JSX
<h1>{welcomeText}</h1>
```

### 5. Update Other Components

**Priority: MEDIUM**

Apply the same pattern to:
- [ ] Menu.jsx - Translate menu labels and items
- [ ] Kitchen.jsx - Translate kitchen display text
- [ ] Cashier.jsx - Translate payment/checkout text
- [ ] Hub.jsx - Translate navigation labels
- [ ] Manager.jsx - Translate manager interface

### 6. Add Language Persistence

**Priority: MEDIUM**

Save user's language choice to localStorage:

```jsx
// In TranslationContext.jsx, add to useEffect:
useEffect(() => {
  localStorage.setItem('selectedLanguage', selectedLanguage);
}, [selectedLanguage]);

// On app load:
const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
setSelectedLanguage(savedLanguage);
```

### 7. Test All Languages

**Priority: HIGH**

For each language:
- [ ] English (en)
- [ ] Spanish (es)
- [ ] French (fr)
- [ ] German (de)
- [ ] Chinese (zh)
- [ ] Japanese (ja)
- [ ] Korean (ko)
- [ ] Portuguese (pt)
- [ ] Russian (ru)
- [ ] Arabic (ar)

Test:
- [ ] All UI text translates
- [ ] Menu items translate
- [ ] Prices display correctly
- [ ] No layout breaks with longer text
- [ ] Language persists on page reload
- [ ] Switching languages updates all text

### 8. Handle Edge Cases

**Priority: MEDIUM**

- [ ] Very long translated text doesn't break layout
- [ ] RTL languages (Arabic) display correctly
- [ ] Non-Latin characters display properly
- [ ] Price numbers stay untranslated
- [ ] Keyboard navigation works with all languages
- [ ] Screen readers work with all languages

### 9. Performance Testing

**Priority: LOW**

- [ ] Test with slow internet (DevTools throttling)
- [ ] Test with many items in menu
- [ ] Monitor Google Cloud API quota
- [ ] Check cache is working (fewer API calls over time)
- [ ] Test on production environment

### 10. Documentation Update

**Priority: LOW**

- [ ] Update your project README with translation feature
- [ ] Document how to set Google Cloud credentials
- [ ] Update deployment documentation
- [ ] Add screenshots of language selector
- [ ] Create user guide for staff setting language

## 🐛 Debugging Checklist

If something isn't working, check these:

### Language Selector Not Appearing
- [ ] WeatherScreen.jsx imports TranslationClient
- [ ] TranslationClient component renders
- [ ] CSS is loading (check DevTools)
- [ ] Browser console has no errors

### Translations Not Working
- [ ] Backend is running (`npm start`)
- [ ] Frontend is running (`npm run dev`)
- [ ] GOOGLE_APPLICATION_CREDENTIALS is set
- [ ] Google Cloud Translation API is enabled
- [ ] Check Network tab for `/api/translate` requests
- [ ] Check server console for errors
- [ ] Verify credentials file path is correct

### Component Not Using Translations
- [ ] Import `useTranslatedText` correctly
- [ ] Context is available (inside TranslationProvider)
- [ ] Hook is called at top level of component
- [ ] Text is being passed to hook correctly
- [ ] Component re-renders when selectedLanguage changes

### Language Not Persisting
- [ ] localStorage API is available
- [ ] Not in private/incognito mode
- [ ] Check browser console for errors
- [ ] Verify localStorage is being set

## 📊 Quality Checklist

Before deploying to production:

- [ ] All test cases pass
- [ ] No console errors or warnings
- [ ] Performance is acceptable (< 1s per translation)
- [ ] All languages display correctly
- [ ] Fallback to English works
- [ ] Error handling is robust
- [ ] Security: credentials are not exposed
- [ ] Code is documented
- [ ] Team knows how to maintain it

## 📚 Documentation to Review

Read these in order:
1. `TRANSLATION_QUICK_REFERENCE.md` - Overview
2. `TRANSLATION_SETUP.md` - Detailed setup
3. `TRANSLATION_ARCHITECTURE.md` - How it works
4. `KIOSK_TRANSLATION_GUIDE.md` - Implementation
5. `PROJECT3_TRANSLATION_EXAMPLES.md` - Code examples

## 💬 Common Questions

**Q: Do I need to set up Google Cloud for local development?**
A: Yes, but it's a one-time setup. After that, it just works.

**Q: Will translations work offline?**
A: No, translations require an internet connection to Google Cloud.

**Q: Can I use a different translation service?**
A: Yes, but you'd need to update Translation.js and the API endpoint.

**Q: How much will this cost?**
A: Google Cloud Translation API is free for first 500K characters/month, then ~$15 per million characters.

**Q: Can I change the supported languages?**
A: Yes, just add to supportedLanguages in TranslationContext.jsx

**Q: How do I deploy this to production?**
A: See TRANSLATION_SETUP.md → Production Deployment section

## ✨ You're All Set!

Everything is in place. Now it's time to:
1. Install dependencies
2. Set up Google Cloud credentials
3. Start translating your components
4. Test and enjoy!

Good luck! 🚀
