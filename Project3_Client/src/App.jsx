import { Routes, Route, Link, useLocation } from 'react-router-dom'
import WeatherScreen from './pages/WeatherScreen.jsx'
import Cashier from './pages/Cashier.jsx'
import Manager from './pages/Manager.jsx'
import Menu from './pages/Menu.jsx'
import Kitchen from './pages/Kitchen.jsx'
import './styles/App.css'


export default function App() {
  const location = useLocation();
  const showButtons = location.pathname === "/";

  return (
    <div>
      {/* Nav Bar */}
      {showButtons && (
        <div className="home-grid">
          <Link to="/weather"><button>Weather</button></Link>
          <Link to="/cashier"><button>Cashier</button></Link>
          <Link to="/manager"><button>Manager</button></Link>
          <Link to="/menu"><button>Menu</button></Link>
          <Link to="/kitchen"><button>Kitchen</button></Link>
        </div>
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
  )
}
