import mockData from '../data/mockData.json';

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWeather = async (lat, lon) => {
  const latitude = lat ?? 17.3850; // Default to Hyderabad, India
  const longitude = lon ?? 78.4867;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=precipitation_probability&forecast_days=1`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch real-time weather data');
  }
  
  const data = await response.json();
  const current = data.current;
  const hourly = data.hourly;
  
  let rainChance = "0%";
  if (hourly && hourly.precipitation_probability) {
    const currentHourIndex = new Date().getHours();
    const prob = hourly.precipitation_probability[currentHourIndex] || hourly.precipitation_probability[0] || 0;
    rainChance = `${prob}%`;
  }
  
  const weatherCode = current.weather_code;
  let condition = "Clear";
  
  if (weatherCode === 0) condition = "Sunny";
  else if (weatherCode >= 1 && weatherCode <= 3) condition = "Partly Cloudy";
  else if (weatherCode === 45 || weatherCode === 48) condition = "Foggy";
  else if ((weatherCode >= 51 && weatherCode <= 57) || (weatherCode >= 80 && weatherCode <= 82)) condition = "Rainy";
  else if (weatherCode >= 61 && weatherCode <= 67) condition = "Rainy";
  else if (weatherCode >= 71 && weatherCode <= 77) condition = "Snowy";
  else if (weatherCode >= 95 && weatherCode <= 99) condition = "Stormy";
  else condition = "Cloudy";

  return {
    temperature: `${Math.round(current.temperature_2m)}°C`,
    humidity: `${current.relative_humidity_2m}%`,
    rainChance,
    condition
  };
};

export const searchCity = async (name) => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to search for city location');
  }
  const data = await response.json();
  if (data.results && data.results.length > 0) {
    return data.results[0];
  }
  return null;
};

export const fetchCrops = async () => {
  await delay(600);
  return mockData.crops;
};

export const fetchPests = async () => {
  await delay(1000);
  return mockData.pests;
};

export const fetchMarketPrices = async () => {
  await delay(700);
  return mockData.marketPrices;
};
