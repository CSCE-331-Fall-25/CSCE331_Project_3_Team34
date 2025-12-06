import { Routes, Route, useNavigate, useLocation, parsePath } from 'react-router-dom'
import { use, useState, useEffect } from 'react'
import WeatherScreen from './pages/WeatherScreen.jsx'
// import pandaLogo from './assets/PandaLogo.svg'
import Cashier from './pages/Cashier.jsx'
import Manager from './pages/Manager.jsx'
import Menu from './pages/Menu.jsx'
import Kitchen from './pages/Kitchen.jsx'
import Kiosk from './pages/Kiosk.jsx'
import Hub from './pages/Hub.jsx'
import MealAttributes  from './pages/MealAttributes.jsx' 
import Login from './pages/Login.jsx'
// import React from 'react'
// import GoogleLoginButton from './Components/googleLoginButton.jsx'
import './styles/App.css'
//import app from '../../Project3_Server/src/index.js'




export default function App() {
  //const location = useLocation();
  //const showButtons = location.pathname === "/";
  // initialize as empty strings so placeholders render correctly
 
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.setItem('loginReturnTo', '/hub');
    navigate('/login?returnTo=/hub&functionality=2');
  }, []);
   
  return (
    <div>

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
