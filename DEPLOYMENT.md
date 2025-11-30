# Deployment Configuration Guide

This application is configured to work seamlessly with cloud deployment platforms like Render, using environment variables instead of local `.env` files.

## How It Works

The application uses `dotenv.config()` which:
- **Local Development**: Loads variables from `.env` file if it exists
- **Production (Render)**: Uses environment variables set directly in the platform
- **Fallbacks**: Provides sensible defaults for local development

## Required Environment Variables for Render

Configure these in your Render dashboard under "Environment Variables":

### Database
```
DATABASE_URL=postgres://username:password@host:port/database
```

### Session Security
```
SESSION_SECRET=<generate-a-strong-random-secret>
```
**Important**: Use a cryptographically secure random string (at least 32 characters)

### Google OAuth
```
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_REDIRECT_URI=https://your-app.onrender.com/api/auth/google/callback
```

### Client Configuration
```
CLIENT_ORIGIN=https://your-frontend.onrender.com
NODE_ENV=production
```

### Server Configuration
```
PORT=8080
```
Note: Render will automatically set PORT, but this is the default fallback.

## Local Development Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your local values in `.env`

3. The `.env` file is already in `.gitignore` and will never be committed

## Deployment Checklist

- [ ] Set all required environment variables in Render dashboard
- [ ] Update `GOOGLE_REDIRECT_URI` to use your production URL
- [ ] Update `CLIENT_ORIGIN` to use your frontend production URL
- [ ] Set `NODE_ENV=production`
- [ ] Generate a strong `SESSION_SECRET`
- [ ] Verify database connection string is correct
- [ ] Ensure `.env` is in `.gitignore` (already done ✓)

## Build & Start Commands for Render

**Build Command**: `npm install`

**Start Command**: `npm start`

The `npm start` script runs `node src/index.js` which is production-ready.

## Security Notes

- Never commit `.env` files to Git
- Never hardcode secrets in source code
- Use GitHub Secrets or Render's environment variables for sensitive data
- Rotate secrets regularly
- Use different credentials for development and production

## Testing Environment Variables

To verify your environment variables are loaded correctly:

```javascript
console.log('Environment check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
```
