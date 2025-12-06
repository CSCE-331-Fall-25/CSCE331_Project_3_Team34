# API Key Setup - Using translateKey from .env

## Overview

The Google Translate integration has been updated to use the `translateKey` from your `.env` file instead of requiring Google Cloud service account credentials.

## Current Setup

Your `Project3_Server/src/.env` file contains:

```
translateKey = AIzaSyAl24SqW8IU-vo3zAHSUaTluvNbG4a_pd0
```

## How It Works

1. **Server starts** → Reads `.env` file
2. **Translation module loads** → Gets `translateKey` from environment
3. **Translation request comes in** → Uses API key to call Google Translate REST API
4. **Response returned** → Text is translated and cached

## What Changed

### Before
- Required Google Cloud service account JSON file
- Required `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Used `@google-cloud/translate` client library

### Now
- Uses simple API key from `.env`
- Uses Google Translate REST API directly
- Much simpler setup and deployment

## For Local Development

**No additional setup needed!** The API key is already in your `.env` file.

Just start the server:
```bash
npm start
```

The key will be automatically loaded.

## For Production (Render)

1. Go to your Render dashboard
2. Add environment variable: `translateKey`
3. Set value to your Google Translate API key
4. Deploy

That's it! No service account files needed.

## If You Need a New API Key

1. Go to https://console.cloud.google.com/
2. Create a project or select existing one
3. Enable "Google Translate API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key
6. Update `.env` file: `translateKey = YOUR_NEW_KEY`

## Security Notes

✅ API key is in `.env` (not in code)  
✅ `.env` is not committed to git  
✅ Simpler than service account approach  
⚠️ Keep the key secure - don't share it  
⚠️ In production, use Render's secrets management

## Troubleshooting

**"Translation service is not available"**
- Check `.env` file has `translateKey` set
- Restart the server
- Check server console for errors

**"API quota exceeded"**
- Monitor usage in Google Cloud Console
- Check for API key usage restrictions
- May need to upgrade API key plan

**"Invalid request"**
- Verify the API key is valid
- Check that the language code is correct
- Look at server logs for details

## How to Debug

1. Check the `.env` file:
   ```bash
   cat Project3_Server/src/.env | grep translateKey
   ```

2. Watch server logs when making translation request:
   ```bash
   npm start
   # Make a translation request
   # Check console output
   ```

3. Verify API key works:
   - Go to Google Translate API docs
   - Test with your key directly
   - Confirm it's enabled in Google Cloud

## File References

- **Translation module:** `Project3_Server/src/Translation.js`
- **API endpoint:** `Project3_Server/src/index.js` (line with `/api/translate`)
- **Configuration:** `Project3_Server/src/.env`

## Cost

- Free tier: 500K characters/month
- After that: ~$15 per million characters
- Monitor usage in Google Cloud Console

## Next Steps

1. ✅ API key is set in `.env`
2. ✅ Server uses it automatically
3. Start developing with translations
4. Test in development
5. Deploy to production with same API key
