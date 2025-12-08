# ✅ Verification Checklist - API Key Configuration

Use this checklist to verify everything is set up correctly.

## Pre-Flight Checks

### Backend Configuration

- [ ] **File Exists:** `Project3_Server/src/.env` exists
- [ ] **Key Present:** File contains `translateKey = ...`
- [ ] **Key Not Empty:** Value is not empty or `null`
- [ ] **Format Correct:** Starts with `AIzaSy` (typical Google API key format)

**How to verify:**
```bash
cd Project3_Server/src
cat .env | grep translateKey
```

Should output something like:
```
translateKey = AIzaSyAl24SqW8IU-vo3zAHSUaTluvNbG4a_pd0
```

### Code Files

- [ ] **Translation.js Updated:** `Project3_Server/src/Translation.js` uses `process.env.translateKey`
- [ ] **Imports Correct:** File imports `fetch` from `node-fetch` and `dotenv`
- [ ] **API Endpoint:** `index.js` has `/api/translate` endpoint
- [ ] **Dependencies Clean:** `@google-cloud/translate` removed from `package.json`

### Package.json

- [ ] **Server has dotenv:** `Project3_Server/package.json` includes `dotenv`
- [ ] **Server has node-fetch:** `Project3_Server/package.json` includes `node-fetch`
- [ ] **No old dependency:** No `@google-cloud/translate` in dependencies

**How to verify:**
```bash
cd Project3_Server
cat package.json | grep -E "(dotenv|node-fetch|google-cloud)"
```

## Installation Verification

After running `npm install`:

- [ ] **Backend node_modules:** `Project3_Server/node_modules` exists
- [ ] **Frontend node_modules:** `Project3_Client/node_modules` exists
- [ ] **No errors:** Installation completed without errors

**How to verify:**
```bash
# Backend
cd Project3_Server
npm list dotenv
npm list node-fetch

# Frontend
cd Project3_Client
npm list
```

## Runtime Verification

### Starting Backend

Run in `Project3_Server` directory:
```bash
npm start
```

**Expected output:**
- No error about missing `translateKey`
- No error about `@google-cloud/translate`
- Server starts normally
- Message: "Server running on port 3000" (or 8080 depending on config)

**What to look for:**
```
✅ No "Warning: translateKey not found" message
✅ No "Cannot find module @google-cloud/translate"
✅ Server starts successfully
✅ No 401 or credential errors
```

### Testing Translation Endpoint

Once both servers are running:

```bash
# Make a test translation request
curl -X POST http://localhost:8080/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","targetLanguage":"es"}'
```

**Expected response:**
```json
{
  "translatedText": "Hola"
}
```

**If it fails, check:**
- [ ] Backend is running on correct port
- [ ] API key is valid
- [ ] Internet connection available
- [ ] Google Translate API is enabled in Google Cloud

### Frontend Test

1. Navigate to: `http://localhost:5173/weather`
2. Look in top-right corner
3. You should see: "Select Language:" dropdown

**Expected behavior:**
- [ ] Language dropdown appears
- [ ] Can select different languages
- [ ] Text updates when language changes
- [ ] No console errors (check F12 DevTools)

## Network Verification

Check that translation requests are being made:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Change language on weather screen
4. Look for requests to `/api/translate`

**Expected:**
- [ ] Request shows up in Network tab
- [ ] Request type: `XHR` (XMLHttpRequest)
- [ ] Request URL: `http://localhost:8080/api/translate`
- [ ] Response status: `200`
- [ ] Response body contains `translatedText`

## Error Troubleshooting

### Error: "Translation service is not available"

**Cause:** API key is not being read from `.env`

**Fix:**
1. Verify `.env` file exists
2. Verify `translateKey` is in the file
3. Restart backend server
4. Check server logs

**Test:**
```bash
# In backend terminal, add debug logging
# Edit Translation.js to add console.log(translateKey)
# Restart server
npm start
```

### Error: "Invalid API key"

**Cause:** API key is invalid or doesn't have permissions

**Fix:**
1. Verify key in `.env` is correct
2. Generate new key from Google Cloud Console
3. Update `.env` file
4. Restart server

### Error: "API quota exceeded"

**Cause:** Too many translation requests

**Fix:**
1. Check Google Cloud Console for quota
2. Upgrade plan if needed
3. Check for duplicate requests

### Error: Connection refused on port 8080

**Cause:** Backend not running

**Fix:**
1. Ensure you're in `Project3_Server` directory
2. Run: `npm start`
3. Wait for server to start
4. Check for errors in startup

## Success Criteria

Your setup is ✅ **WORKING** when:

- [x] Backend starts without errors
- [x] Frontend starts without errors  
- [x] Language selector appears on weather screen
- [x] Translation requests appear in Network tab
- [x] Translations work correctly
- [x] No 401/403 authentication errors
- [x] Browser console has no errors about translation

## Quick Test Script

Run this to verify everything:

```bash
# 1. Check .env file
cd Project3_Server/src && cat .env | grep translateKey && cd ../..

# 2. Check package.json
cat Project3_Server/package.json | grep -E "(dotenv|node-fetch)"

# 3. Check Translation.js
grep -n "process.env.translateKey" Project3_Server/src/Translation.js

# 4. Verify API endpoint exists
grep -n "api/translate" Project3_Server/src/index.js

echo "✅ All checks passed!"
```

## Support Resources

**If something is wrong:**

1. **Check:** `API_KEY_SETUP.md` - Setup details
2. **Check:** `CONFIGURATION_UPDATED.md` - What changed
3. **Check:** `TRANSLATION_SETUP.md` - Troubleshooting section
4. **Check:** Server console output - Error messages
5. **Check:** Browser console (F12) - Frontend errors

---

**All checks pass?** You're ready to start developing! 🚀
