import { useState, useEffect } from 'react';
import { fetchWeather, searchCity } from '../utils/api';
import WeatherCard from '../components/WeatherCard';
import Loader from '../components/Loader';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('Hyderabad, Telangana, India (Default)');
  const [coordinates, setCoordinates] = useState({ lat: 17.3850, lon: 78.4867 });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const getWeatherData = async (lat, lon, label) => {
    try {
      setLoading(true);
      setError(null);
      
      let finalLabel = label;
      if (label === 'Your Current Location') {
        try {
          const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            const town = geoData.localityName || geoData.locality || '';
            const city = geoData.city || '';
            const state = geoData.principalSubdivision || '';
            const country = geoData.countryName || '';
            
            const parts = [];
            if (town) parts.push(town);
            if (city && city.toLowerCase() !== town.toLowerCase()) parts.push(city);
            if (state) parts.push(state);
            if (country) parts.push(country);

            if (parts.length > 0) {
              finalLabel = `Current Location: ${parts.join(', ')}`;
            } else {
              finalLabel = `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
            }
          } else {
            finalLabel = `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          }
        } catch (geoErr) {
          console.warn('Reverse geocoding error:', geoErr);
          finalLabel = `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
        }
      }

      const data = await fetchWeather(lat, lon);
      setWeatherData(data);
      setCoordinates({ lat, lon });
      setLastUpdated(new Date().toLocaleTimeString());
      if (finalLabel) {
        setLocationName(finalLabel);
      }
    } catch {
      setError('Failed to fetch real-time weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const detectLocationAndFetch = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              const { latitude, longitude } = position.coords;
              getWeatherData(latitude, longitude, 'Your Current Location');
            }
          },
          (err) => {
            console.log('Geolocation error or denied:', err);
            if (isMounted) {
              // Fallback to Hyderabad
              getWeatherData(17.3850, 78.4867, 'Hyderabad, Telangana, India (Default)');
            }
          }
        );
      } else if (isMounted) {
        // Fallback to Hyderabad
        getWeatherData(17.3850, 78.4867, 'Hyderabad, Telangana, India (Default)');
      }
    };

    detectLocationAndFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  // background refresh interval to update weather data quietly every 60 seconds
  useEffect(() => {
    let isMounted = true;
    
    const interval = setInterval(async () => {
      if (!coordinates) return;
      try {
        const data = await fetchWeather(coordinates.lat, coordinates.lon);
        if (isMounted) {
          setWeatherData(data);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.log('Background weather refresh failed:', err);
      }
    }, 60000); // 60 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [coordinates]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError(null);
      const result = await searchCity(searchQuery);
      if (result) {
        const { latitude, longitude, name, country, admin1 } = result;
        const label = `${name}${admin1 ? `, ${admin1}` : ''}${country ? `, ${country}` : ''}`;
        await getWeatherData(latitude, longitude, label);
        setSearchQuery('');
      } else {
        setError(`City "${searchQuery}" not found. Please try another search.`);
      }
    } catch {
      setError('Error searching for city. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherData(latitude, longitude, 'Your Current Location');
        },
        () => {
          setError('Could not access location. Please check your permissions.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="page-container">
      <h2>Weather Updates</h2>
      
      <form onSubmit={handleSearch} className="weather-search-container">
        <input
          type="text"
          className="weather-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a city (e.g. Hyderabad, Delhi)..."
          disabled={loading || searching}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="weather-location-btn"
          title="Use current location"
          disabled={loading || searching}
        >
          📍
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      
      <Loader loading={loading} message="Fetching real-time weather data..." />
      
      {!loading && weatherData && (
        <div className="weather-container">
          <div className="weather-location-title">
            📍 {locationName}
          </div>
          {lastUpdated && (
            <small className="weather-last-updated">
              Last updated: {lastUpdated} (auto-refreshing lively)
            </small>
          )}
          <WeatherCard data={weatherData} />
        </div>
      )}
    </div>
  );
};

export default Weather;
