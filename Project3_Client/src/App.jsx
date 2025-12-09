import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import WeatherScreen from './pages/WeatherScreen.jsx'
import Cashier from './pages/Cashier.jsx'
import Manager from './pages/Manager.jsx'
import Menu from './pages/Menu.jsx'
import Kitchen from './pages/Kitchen.jsx'
import Kiosk from './pages/Kiosk.jsx'
import Hub from './pages/Hub.jsx'
import MealAttributes  from './pages/MealAttributes.jsx' 
import Login from './pages/Login.jsx'
import './styles/App.css'

import { getImageForItem } from './assets/utils/imageMapper';
import { TranslationProvider } from './contexts/TranslationContext';




export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    // Don't redirect if we're already on a specific page (checking current pathname)
    const currentPath = window.location.pathname;
    
    // If already on a route other than root, don't force redirect
    if (currentPath && currentPath !== '/' && currentPath !== '') {
      return;
    }
    
    // Only redirect to login if on root path
    sessionStorage.setItem('loginReturnTo', '/hub');
    navigate('/login?returnTo=/hub&functionality=2');
  }, [navigate]);
   
  return (
    <TranslationProvider>
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
    </TranslationProvider>
  )
}
