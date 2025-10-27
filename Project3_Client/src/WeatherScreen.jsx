import { useState, useEffect } from 'react';

export default function WeatherScreen() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        {location ? (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <p>Fetching location...</p>
      )}

      <button onClick={fetchWeather} disabled={!location || loading}>
        {loading ? 'Loading...' : 'Fetch Weather'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {weather && (
        <div>
            <h2>Weather Data:</h2>
            {weather.periods?.[0] && (
                <>
                    <p>{weather.periods[0].shortForecast}</p>
                    <p>Temperature: {weather.periods[0].temperature} °F</p>
                </>
            )}
        </div>
      )}
    </div>
  );
}