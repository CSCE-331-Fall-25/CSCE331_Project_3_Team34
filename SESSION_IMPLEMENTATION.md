# Cookie-Based Session Implementation Guide

## What We Built

We implemented **per-user sessions** so each cashier has their own separate transaction data. Before this change, all users shared the same transaction—now each browser session gets its own isolated state.

---

## How It Works

### 1. **Install Dependencies**

Run in the `Project3_Server` folder:
```bash
npm install express-session cookie-parser
```

**What these do:**
- `express-session`: Manages session data on the server (creates unique session IDs)
- `cookie-parser`: Reads cookie headers from HTTP requests

---

### 2. **Server Setup (index.js)**

#### Import the packages:
```javascript
import session from "express-session";
import cookieParser from "cookie-parser";
```

#### Configure CORS to allow credentials:
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  credentials: true // CRITICAL: allows cookies to be sent cross-origin
}));
```

**Why?** By default, browsers block cookies between different origins (your React app on port 5173 and Express on port 8080). `credentials: true` enables cross-origin cookie sharing.

#### Add session middleware:
```javascript
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true for HTTPS
    httpOnly: true, // prevents JavaScript access (security)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

**What this does:**
- Assigns each browser a unique `sessionID` stored in a cookie
- Stores session data server-side (not in the cookie itself)
- Cookie is sent automatically with every request

---

### 3. **Session Storage**

#### Replace global mainPage with per-session storage:

**Before (shared state):**
```javascript
const mainPage = new CashierMainPage(user, pool);
```

**After (isolated sessions):**
```javascript
const sessionStore = new Map();

function getMainPageForSession(req) {
  const sessionID = req.sessionID; // Provided by express-session
  
  if (!sessionStore.has(sessionID)) {
    // First request from this session - create new instance
    const user = new User(`session-${sessionID}`, "password", "session@example.com");
    const mainPage = new CashierMainPage(user, pool);
    sessionStore.set(sessionID, mainPage);
    console.log(`Created new session for ${sessionID}`);
  }
  
  return sessionStore.get(sessionID);
}
```

**Key concept:**
- `Map` stores `sessionID -> CashierMainPage` pairs
- Each session gets its own `CashierMainPage` instance with its own transaction data
- Sessions persist in memory (cleared if server restarts)

---

### 4. **Update API Endpoints**

Replace every occurrence of `mainPage` with `getMainPageForSession(req)`:

**Example:**
```javascript
app.post('/api/buy-item', async (req, res) => {
  const mainPage = getMainPageForSession(req); // Get this session's instance
  const result = await mainPage.BuyItemButton(req.body.itemID, ...);
  res.json({ success: true, ...result });
});
```

**Why?** Each HTTP request contains a cookie with the sessionID. We look up that session's `mainPage` instance to ensure we're modifying the correct user's data.

---

### 5. **Client-Side Changes**

Add `credentials: 'include'` to EVERY fetch call:

**Before:**
```javascript
fetch("/api/buy-item", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ itemID })
})
```

**After:**
```javascript
fetch("/api/buy-item", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include', // Send cookies with this request
  body: JSON.stringify({ itemID })
})
```

**Why?** By default, `fetch()` doesn't send cookies cross-origin. `credentials: 'include'` forces the browser to include the session cookie.

---

## Testing It Works

### Test in Browser:

1. **Start both servers:**
   ```bash
   # Terminal 1 - Server
   cd Project3_Server
   npm run dev

   # Terminal 2 - Client
   cd Project3_Client
   npm run dev
   ```

2. **Open two browser windows side-by-side** (or use incognito for the second one)

3. **Go to the cashier page in both windows**

4. **Add items in Window 1** → only Window 1's order should show items

5. **Add different items in Window 2** → Window 2 should have separate items

6. **Check the server logs** → should see "Created new session for [different sessionID]" twice

---

## Understanding Sessions vs Cookies

### Cookies:
- **Small text files** stored in the browser
- Sent automatically with every request to the same domain
- In our case: stores only the `sessionID` (e.g., `s%3Aj7k2m...`)

### Sessions:
- **Server-side storage** of user data
- Indexed by sessionID
- Stores the actual `CashierMainPage` instance with transactions

### Flow:
1. Browser makes first request → Server creates session, sends sessionID cookie
2. Browser stores cookie
3. Browser makes next request → automatically includes cookie
4. Server reads sessionID from cookie → looks up session data → uses correct `mainPage`

---

## Common Issues

### "Can't see items I added"
- **Check:** Did you add `credentials: 'include'` to ALL fetch calls?
- **Check:** Is CORS configured with `credentials: true`?

### "Sessions reset on refresh"
- **Expected:** Sessions are stored in memory. Server restart = data loss
- **Fix (advanced):** Use `express-session` with a database store (Redis, MongoDB)

### "Two tabs share the same session"
- **Expected:** Tabs in the same browser share cookies
- **Test isolation:** Use incognito/private mode or different browsers

---

## Security Notes

### Production Changes Needed:

1. **Change the secret:**
   ```javascript
   secret: process.env.SESSION_SECRET // Store in environment variable
   ```

2. **Enable HTTPS cookies:**
   ```javascript
   cookie: {
     secure: true, // Only send over HTTPS
     sameSite: 'strict' // Prevents CSRF attacks
   }
   ```

3. **Use a session store:**
   ```javascript
   import RedisStore from "connect-redis";
   
   app.use(session({
     store: new RedisStore({ client: redisClient }),
     // ... other options
   }));
   ```

---

## Key Takeaways

1. **Sessions = server-side storage** indexed by a cookie
2. **Cookies = small IDs** sent automatically by the browser
3. **`credentials: 'include'`** required for cross-origin cookies
4. **One session per browser** (tabs share, incognito is separate)
5. **Sessions persist** until timeout or server restart

---

## Next Steps

If you want to enhance this:
- **Link to actual user login:** Replace `session-${sessionID}` with real employee data from login
- **Session persistence:** Store sessions in a database so they survive server restarts
- **Session timeout:** Auto-logout after inactivity
- **Session cleanup:** Periodically remove old/expired sessions from the Map
