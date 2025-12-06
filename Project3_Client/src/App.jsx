import { Routes, Route, useNavigate, useLocation, parsePath } from 'react-router-dom'
import { use, useState, useEffect } from 'react'
import WeatherScreen from './pages/WeatherScreen.jsx'
import pandaLogo from './assets/PandaLogo.svg'
import Cashier from './pages/Cashier.jsx'
import Manager from './pages/Manager.jsx'
import Menu from './pages/Menu.jsx'
import Kitchen from './pages/Kitchen.jsx'
import Kiosk from './pages/Kiosk.jsx'
import Hub from './pages/Hub.jsx'
import MealAttributes  from './pages/MealAttributes.jsx' 
import Login from './pages/Login.jsx'
import React from 'react'
import GoogleLoginButton from './Components/googleLoginButton.jsx'
import './styles/App.css'
//import app from '../../Project3_Server/src/index.js'

import { getImageForItem } from './assets/utils/imageMapper';



export default function App() {
  const location = useLocation();
  const showButtons = location.pathname === "/";
  // initialize as empty strings so placeholders render correctly
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const navigate = useNavigate();

  function handleIdChange(event) {
    setEmployeeId(event.target.value);
  }

  function handlePasswordChange(event) {
    setEmployeePassword(event.target.value);
  }

  async function isValidLogin(userName, password) {
    try {
      const res = await fetch('/api/authenticate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: userName, password })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        console.log('Login successful for user:', userName);
        return true;
      }
      console.log('Login failed for user:', userName, data);
      return false;
    } catch (error) {
      console.error('Error during login request:', error);
      return false;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const trimmedId = employeeId ? employeeId.trim() : '';
    const trimmedPassword = employeePassword ? employeePassword.trim() : '';
    if (!trimmedId || !trimmedPassword) {
      alert('Please enter both Employee ID and Password.');
      return;
    }
    console.log("Logging in with ID:", employeeId, "and Password:", employeePassword);

    const ok = await isValidLogin(trimmedId, trimmedPassword);
    if (ok) {
      navigate('/hub');
    } else {
      alert('Invalid Employee ID or Password.');
    }
  }

  //called when returning from Google OAuth flow
  async function handleGoogleLogin(params, googleid = null) {
    //console.log('Handling Google Login callback');
    const isSuccess = params.get('success');
    const add = params.get('add');
    if (isSuccess === 'true') {
      // Fetch user info from backend
      const res = await fetch('/api/auth/me', { credentials: 'include' });

      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if(!data || !data.user) {
          alert('Google Login Failed: No user data returned.');
          return;
        }
        if (data.user && data.user.isEmployee) {
          // Proceed with your logic
          if(add === 'true'){ 
            await fetch('/api/add-googleid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: data.user.userName, googleid: '107052280673566149562' })
            });
            alert('added');
          }
          navigate('/hub');
        } else {
          alert('Google Login Failed: Not an Employee.');
        }
      } else {
        const text = await res.text();
        console.error('Non-JSON response from /auth/me:', text);
        alert('Google Login Failed: Server did not return JSON.');
      }
    } else if (isSuccess === 'false') {
      // Prevent double alert by cleaning up URL and returning immediately
      if (window.location.search.includes('success=false')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (!window._googleLoginFailedAlerted) {
        window._googleLoginFailedAlerted = true;
        alert('Google Login Failed. Please try again.');
      }
      return;
    }
  }
  function clearInputs (){
    setEmployeeId('');
    setEmployeePassword('');
  }
  
    // Clear inputs when the login view is shown (runs on mount and whenever route returns to "/")
    useEffect(() => {
      if (showButtons) clearInputs();
    }, [showButtons]);
    useEffect(() => {
      console.log('App mounted, checking for Google Login callback');
      // If we are on the login page, let the Login component handle the callback
      if (window.location.pathname === '/login') return;

      const params = new URLSearchParams(window.location.search);
      if (params.get('success')) {
        handleGoogleLogin(params);
      }
    }, []);
  return (
    <div>
      {showButtons && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Welcome to Panda Express</h1>
          <button onClick={() => {
            sessionStorage.setItem('loginReturnTo', '/hub');
            navigate('/login?returnTo=/hub&functionality=2');
          }} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Go to Login
          </button>
        </div>
      )}
      
        

     

      {/* Routing logic */}
      <Routes>
        <Route path="/weather" element={<WeatherScreen />} />
        <Route path="/setmeal" element={<MealAttributes />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<div />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        {/* Removed invalid Route that used `this` as element. */}
      </Routes>
    </div>
  )
}
