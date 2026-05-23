import { useState, useEffect } from 'react';
import { fetchWeather } from '../utils/api';
import WeatherCard from '../components/WeatherCard';
import Loader from '../components/Loader';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getWeatherData = async () => {
      try {
        setLoading(true);
        const data = await fetchWeather();
        if (isMounted) {
          setWeatherData(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch weather data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getWeatherData();

    return () => {
      isMounted = false; // Cleanup to prevent state updates on unmounted component
    };
  }, []);

  return (
    <div className="page-container">
      <h2>Weather Updates</h2>
      {error && <p className="error-message">{error}</p>}

      <Loader loading={loading} message="Fetching latest weather data..." />

      {!loading && weatherData && (
        <div className="weather-container">
          <WeatherCard data={weatherData} />
        </div>
      )}
    </div>
  );
};

export default Weather;
