import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WeatherScreen.css'

export default function WeatherScreen() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  const fetchWeather = async () => {
    if (!location) {
        setError('Location not available');
        return;
    }
    try {
      setError(null);
      setWeather(null);
      const response = await fetch(`https://api.weather.gov/points/${location.latitude},${location.longitude}`);
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      const data = await response.json();
      
      const forecastUrl = data?.properties?.forecast;
      if (!forecastUrl) {
        throw new Error('Forecast URL not found in point data');
      }

      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error('Forecast API request failed');
      }
      const forecastData = await forecastResponse.json();
      setWeather({
        name: data?.properties?.relativeLocation?.properties?.city || 'Forecast',
        periods: forecastData?.properties?.periods || [],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper: map a shortForecast string to a local fallback icon (emoji or asset path)
  const mapShortForecastToFallback = (shortForecast) => {
    if (!shortForecast) return null;
    const s = shortForecast.toLowerCase();
    if (s.includes('sun') || s.includes('clear')) return new URL('../assets/weather_icons/day.svg', import.meta.url).href;
    if (s.includes('partly') && s.includes('cloud')) return new URL('../assets/weather_icons/cloudy-day-1.svg', import.meta.url).href;
    if (s.includes('mostly') && s.includes('cloud')) return new URL('../assets/weather_icons/cloudy.svg', import.meta.url).href;
    if (s.includes('cloud') || s.includes('overcast')) return new URL('../assets/weather_icons/cloudy.svg', import.meta.url).href;
    if (s.includes('rain') || s.includes('showers') || s.includes('sprinkles')) return new URL('../assets/weather_icons/rainy-6.svg', import.meta.url).href;
    if (s.includes('thunder') || s.includes('t-storm')) return new URL('../assets/weather_icons/thunder.svg', import.meta.url).href;
    if (s.includes('snow') || s.includes('sleet') || s.includes('flurr')) return new URL('../assets/weather_icons/snowy-6.svg', import.meta.url).href;
    if (s.includes('fog') || s.includes('haze') || s.includes('mist')) return new URL('../assets/weather_icons/cloudy.svg', import.meta.url).href;
    if (s.includes('wind') || s.includes('breezy')) return new URL('../assets/weather_icons/cloudy-day-1.svg', import.meta.url).href;
    return new URL('../assets/weather_icons/cloudy.svg', import.meta.url).href;
  }

  useEffect(() => {
    fetchWeather();
  }, [location]);

  function handleClick() {
    navigate("/kiosk");
  }

  return (
    <div className="weatherScreen" onClick={() => handleClick()}>
        {location ? (
        <p></p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <p>Fetching location...</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {weather ? (
        <div>
            {weather.periods?.[0] && (() => {
                const current = weather.periods[0];
                const icon = mapShortForecastToFallback(current.shortForecast);
                return (
                  <>
                    <div className="weatherIcon">
                      <img src={icon} alt={current.shortForecast} />
                    </div>
                    <div className="temperature">
                      <p style={{ margin: 0 }}>{current.temperature}°</p>
                    </div>
                  </>
                )
            })()}
        </div>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}