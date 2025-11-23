import dotenv from 'dotenv';
// Load .env file only if it exists (for local development)
// In production (Render), environment variables are set directly
dotenv.config();
import User from './User.js';



import { OAuth2Client } from 'google-auth-library';

// Build redirect URI from API URL if GOOGLE_REDIRECT_URI is not explicitly set
const apiUrl = process.env.VITE_API_URL || 'http://localhost:8080';
const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${apiUrl}/auth/google/callback`;

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);
 
function redirectToAppWithLoginSuccess(req, res) {
  const returnTo = req.query.returnTo || '/';
  const state = JSON.stringify({ returnTo, add: req.query.add, link: req.query.link });
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["email", "profile"],
    state: state
  });

  // console.log('Auth URL:', url);
  try {
    const u = new URL(url);
    // console.log('client_id param:', u.searchParams.get('client_id') ? 'present' : 'MISSING');
    // console.log('redirect_uri param:', u.searchParams.get('redirect_uri'));
  } catch (err) {
    console.log('Could not parse auth URL for debug:', err);
  }
  res.redirect(url);
}

async function googleAuthCallbackHandler(req, res) {
  const code = req.query.code;
  const state = req.query.state ? JSON.parse(req.query.state) : {};

  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token;

  // Verify the token
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  // Payload contains user info
  const googleId = payload.sub;
  const add = state.add === 'true' ? '&add=true' : '';
  const link = state.link === 'true';
  const returnTo = state.returnTo || '/';
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  
  // If in link mode, just return the googleid to frontend
  if (link) {
    return res.redirect(`${clientOrigin}${returnTo}?link=true&googleid=${googleId}`);
  }
  
  const user = await User.FetchByGoogleId(req.app.locals.dbPool, googleId);
  if (!user) {
    // Not found or not an employee
    return res.redirect(`${clientOrigin}${returnTo}?success=false${add}`);
  }
  // const user = {
  //   googleId: payload.sub,
  //   name: payload.name,
  //   email: payload.email,
  //   picture: payload.picture
  // };
  req.session.user = user;            // store user on the server session
  // redirect to your React app - use a safe front-end route
  res.redirect(`${clientOrigin}${returnTo}?success=true${add}`); //passing login success param
}

function authMeHandler(req, res) {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
}

function CheckIfGoogleIDExists(dbPool, googleId) {
  return User.FetchByGoogleId(dbPool, googleId)
    .then(user => !!user) // return true if user exists, false otherwise
    .catch(err => {
      console.error('Error checking Google ID existence:', err);
      throw err;
    });
}

async function LinkGoogleIDToUser(dbPool, username, googleId) {
  const existingUser = await User.FetchByGoogleId(dbPool, googleId);
  if(existingUser) {
    console.error(`Google ID already linked to another user: ${googleId} (linked to: ${existingUser.username})`);
    return Promise.reject(new Error(`Google ID already linked to another user: ${existingUser.username}`));
  }
  const success = await User.LinkGoogleIdToUser(dbPool, username, googleId)
  return success;
}


async function UnlinkGoogleIDFromUser(dbPool, username) {
  // Use User.UnlinkGoogleId to handle unlinking logic
  return await User.UnlinkGoogleId(dbPool, username);
}

export { redirectToAppWithLoginSuccess, googleAuthCallbackHandler, authMeHandler, LinkGoogleIDToUser, UnlinkGoogleIDFromUser };