# 🚀 Quick Start Guide - Google Translate for Kiosk

## ⏱️ Takes 6 Minutes

Follow these steps to get translations working on your kiosk.

---

## Step 1: Install Packages (2 minutes)

Open PowerShell and run:

```powershell
# Navigate to frontend folder
cd C:\Users\muska\OneDrive\Documents\GitHub\CSCE331_Project_3_Team34\Project3_Client
npm install

# Navigate to backend folder  
cd ..\Project3_Server
npm install

# Wait for both to complete...
```

**Status Check:**
- ✅ No errors in console
- ✅ `node_modules` folders created

---

## Step 2: Verify API Key is Set (1 minute)

Your `.env` file already has the `translateKey` configured:

```
translateKey = AIzaSyAl24SqW8IU-vo3zAHSUaTluvNbG4a_pd0
```

**If you need to update it:**

1. Open: `Project3_Server/src/.env`

2. Find the line: `translateKey = `

3. Replace with your API key if needed (or use the existing one)

4. Save the file

**That's it!** The server will automatically load this key from the `.env` file.

**Status Check:**
- ✅ `.env` file exists in `Project3_Server/src/`
- ✅ `translateKey` is present in the file

---

## Step 3: Start the Servers (2 minutes)

### Terminal 1 - Backend

```powershell
cd C:\Users\muska\OneDrive\Documents\GitHub\CSCE331_Project_3_Team34\Project3_Server
npm start
```

Wait for:
```
Server running on port 3000
```

### Terminal 2 - Frontend

```powershell
cd C:\Users\muska\OneDrive\Documents\GitHub\CSCE331_Project_3_Team34\Project3_Client
npm run dev
```

Wait for:
```
Local: http://localhost:5173/
```

**Status Check:**
- ✅ Backend shows "Server running on port 3000"
- ✅ Frontend shows local URL
- ✅ No error messages

---

## Step 4: Test Language Selector (1 minute)

1. Open browser: **http://localhost:5173/weather**

2. Look for **language dropdown in top-right corner**
   - It says "Select Language:" with a dropdown

3. Click the dropdown and select "Spanish" (Español)

4. You should see the text update:
   - "Tap To Start" → (in Spanish)
   - "Select Language:" → (in Spanish)

5. Try other languages:
   - French (Français)
   - German (Deutsch)
   - Chinese (中文)

**Status Check:**
- ✅ Language dropdown appears in top-right
- ✅ Can select different languages
- ✅ Text translates when you select a language
- ✅ No errors in browser console

---

## 🎉 Success!

If you got this far, congratulations! Your translation system is working!

---

## 📚 What's Next?

### Quick: Test More Features (5 minutes)
1. Click "Tap To Start" to go to Kiosk
2. Try changing language again
3. Refresh page - language selection persists
4. Check browser console for any errors

### Short Term: Integrate into Kiosk (1-2 hours)
1. Read: [KIOSK_TRANSLATION_GUIDE.md](./KIOSK_TRANSLATION_GUIDE.md)
2. Update `Kiosk.jsx` to use translations
3. Test all UI elements translate

### Medium Term: Full Integration (2-3 hours)
1. Update Menu.jsx
2. Update Cashier.jsx
3. Update Kitchen.jsx
4. Update Manager.jsx
5. Add language persistence

---

## ⚡ Common Issues & Fixes

### "Language selector not appearing"
```
✓ Check that you're at http://localhost:5173/weather
✓ Check browser console for errors (F12)
✓ Try refreshing page
✓ Check WeatherScreen.jsx was properly updated
```

### "Translations not showing, still in English"
```
✓ Check Network tab (F12 → Network) for /api/translate requests
✓ Check server console for errors
✓ Verify GOOGLE_APPLICATION_CREDENTIALS is set
✓ Check credentials file actually exists
```

### "Error: Translation service not available"
```
✓ GOOGLE_APPLICATION_CREDENTIALS not set - set it in PowerShell
✓ Credentials file path wrong - verify path in variable
✓ Backend not running - check terminal 1
✓ Google Cloud API not enabled - enable in console
```

### "Dropdown shows in wrong place / styling looks broken"
```
✓ Try hard refresh: Ctrl+Shift+R
✓ Clear browser cache
✓ Check CSS file was created (TranslationClient.css)
```

---

## 🔍 Verification Checklist

- [ ] npm install completed without errors
- [ ] GOOGLE_APPLICATION_CREDENTIALS environment variable set
- [ ] Backend server started (shows "Server running on port 3000")
- [ ] Frontend server started (shows "Local: http://localhost:5173/")
- [ ] Browser opens to weather screen
- [ ] Language dropdown visible in top-right
- [ ] Can select different language
- [ ] Text changes when language selected
- [ ] Browser console shows no errors
- [ ] Backend console shows no errors

✅ **All checked?** You're good to go! 🚀

---

## 📖 Documentation Map

```
├── GOOGLE_TRANSLATE_README.md          ← Overview
├── TRANSLATION_IMPLEMENTATION_SUMMARY.md ← What was built
├── IMPLEMENTATION_CHECKLIST.md          ← Detailed checklist
├── QUICK_START_GUIDE.md                 ← This file
├── TRANSLATION_QUICK_REFERENCE.md       ← Reference
├── TRANSLATION_SETUP.md                 ← Detailed setup
├── TRANSLATION_ARCHITECTURE.md          ← How it works
├── KIOSK_TRANSLATION_GUIDE.md           ← Integration guide
└── PROJECT3_TRANSLATION_EXAMPLES.md     ← Code examples
```

---

## 🆘 Still Stuck?

1. **Check the relevant documentation** based on your issue
2. **Look at Network tab** (F12) to see API requests
3. **Check console errors** (F12) - browser console first, then server console
4. **Verify environment variable** - run `$env:GOOGLE_APPLICATION_CREDENTIALS` in PowerShell
5. **Try restarting** servers in new PowerShell window

---

## ✅ Next Step

Once this is working:

👉 **Read:** [KIOSK_TRANSLATION_GUIDE.md](./KIOSK_TRANSLATION_GUIDE.md)

This will show you how to add translations to your Kiosk component.

---

**You got this! 🐼**
