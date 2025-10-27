import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import WeatherScreen from './pages/WeatherScreen.jsx'
import Cashier from './pages/Cashier.jsx'
import Manager from './pages/Manager.jsx'
import Menu from './pages/Menu.jsx'
import Kitchen from './pages/Kitchen.jsx'

export default function App() {
  const location = useLocation();
  const showButtons = location.pathname === "/";

  return (
    <div>
      {/* Nav Bar */}
      <div>
        {showButtons && (
          <>
            <Link to="/weather"><button>Weather</button></Link>
            <Link to="/cashier"><button style={{ marginLeft: '0.5rem' }}>Cashier</button></Link>
            <Link to="/manager"><button style={{ marginLeft: '0.5rem' }}>Manager</button></Link>
            <Link to="/menu"><button style={{ marginLeft: '0.5rem' }}>Menu</button></Link>
            <Link to="/kitchen"><button style={{ marginLeft: '0.5rem' }}>Kitchen</button></Link>
          </>
        )}

        {/* Routing logic */}
        <Routes>
          <Route path="/weather" element={<WeatherScreen />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/kitchen" element={<Kitchen />} />
        </Routes>
      </div>
    </div>
  )
}
