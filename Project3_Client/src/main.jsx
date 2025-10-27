import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import WeatherScreen from './WeatherScreen.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WeatherScreen />
  </StrictMode>,
)
