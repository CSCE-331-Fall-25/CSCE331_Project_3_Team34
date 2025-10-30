import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import WeatherScreen from './pages/WeatherScreen.jsx'
import Cashier from './pages/Cashier.jsx'
import Manager from './pages/Manager.jsx'
import Menu from './pages/Menu.jsx'
import Kitchen from './pages/Kitchen.jsx'
import Kiosk from './pages/Kiosk.jsx'
import Hub from './pages/Hub.jsx'
import './styles/App.css'


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

  function handleLogin(event) {
    event.preventDefault();
    const trimmedId = employeeId ? employeeId.trim() : '';
    const trimmedPassword = employeePassword ? employeePassword.trim() : '';
    if (!trimmedId || !trimmedPassword) {
      alert('Please enter both Employee ID and Password.');
      return;
    }
    console.log("Logging in with ID:", employeeId, "and Password:", employeePassword);

    if(trimmedId === 'admin' && trimmedPassword === 'password') {
      navigate("/hub");
    } else {
      alert('Invalid Employee ID or Password.');
    }
  }

  return (
    <div>
      {showButtons && (
        <div className="login-container">
          <img
            className="login-logo"
            src={new URL('./assets/PandaLogo.svg', import.meta.url).href}
            alt="Panda Express Logo Vector@clipartmax.com"
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
        </div>
      )}

      {/* Routing logic */}
      <Routes>
        <Route path="/weather" element={<WeatherScreen />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/" element={<Cashier />} />
      </Routes>
    </div>
  )
}
