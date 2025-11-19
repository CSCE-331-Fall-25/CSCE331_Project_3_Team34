import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import React from 'react'
import GoogleLoginButton from './Components/googleLoginButton.jsx'
import './styles/App.css'
//import app from '../../Project3_Server/src/index.js'



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
  function clearInputs (){
    setEmployeeId('');
    setEmployeePassword('');
  }
    // Clear inputs when the login view is shown (runs on mount and whenever route returns to "/")
    useEffect(() => {
      if (showButtons) clearInputs();
    }, [showButtons]);
  return (
    <div>
      
      {showButtons && (
        <div className="login-container">
          <img
            className="login-logo"
            src={pandaLogo}
            alt="Panda Express Logo"
          />
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="Employee ID"
              value={employeeId ?? ''}
              onChange={handleIdChange}
            />
            <input
              type="password"
              placeholder="Password"
              value={employeePassword ?? ''}
              onChange={handlePasswordChange}
            />
            <button type="submit">Login</button>
            
          </form>
          <button onClick={() => navigate("/hub")}>
            Debugging Skip Login
          </button>
          <GoogleLoginButton />
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
        {/* Root path shows the login UI (App displays the login form when pathname === "/").
            Keep the route lightweight so the login form isn't duplicated with another page. */}
        <Route path="/" element={<div />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        {/* Removed invalid Route that used `this` as element. */}
      </Routes>
    </div>
  )
}
