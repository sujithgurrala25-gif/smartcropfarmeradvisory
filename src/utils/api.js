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

// Detailed Telangana Mandi Prices Database
const baselinePrices = [
  {
    id: "ts-m1",
    mandi: "Warangal (Enumamula)",
    district: "Warangal",
    crop: "Red Chilli",
    variety: "Teja",
    minPrice: 17500,
    maxPrice: 22000,
    modalPrice: 19500,
    trend: "Up",
    arrivals: 4200,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m2",
    mandi: "Warangal (Enumamula)",
    district: "Warangal",
    crop: "Cotton",
    variety: "Long Staple",
    minPrice: 6800,
    maxPrice: 7950,
    modalPrice: 7400,
    trend: "Up",
    arrivals: 8500,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m3",
    mandi: "Warangal (Enumamula)",
    district: "Warangal",
    crop: "Paddy",
    variety: "Grade A",
    minPrice: 2203,
    maxPrice: 2350,
    modalPrice: 2280,
    trend: "Stable",
    arrivals: 15000,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m4",
    mandi: "Nizamabad",
    district: "Nizamabad",
    crop: "Turmeric",
    variety: "Finger",
    minPrice: 11000,
    maxPrice: 14500,
    modalPrice: 13200,
    trend: "Up",
    arrivals: 3200,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m5",
    mandi: "Nizamabad",
    district: "Nizamabad",
    crop: "Paddy",
    variety: "Common",
    minPrice: 2183,
    maxPrice: 2240,
    modalPrice: 2203,
    trend: "Stable",
    arrivals: 9800,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m6",
    mandi: "Khammam",
    district: "Khammam",
    crop: "Red Chilli",
    variety: "Teja",
    minPrice: 17000,
    maxPrice: 21500,
    modalPrice: 19000,
    trend: "Down",
    arrivals: 3500,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m7",
    mandi: "Khammam",
    district: "Khammam",
    crop: "Cotton",
    variety: "Medium Staple",
    minPrice: 6500,
    maxPrice: 7300,
    modalPrice: 6900,
    trend: "Down",
    arrivals: 5200,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m8",
    mandi: "Suryapet",
    district: "Suryapet",
    crop: "Paddy",
    variety: "Grade A",
    minPrice: 2203,
    maxPrice: 2360,
    modalPrice: 2300,
    trend: "Up",
    arrivals: 11000,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m9",
    mandi: "Badepally",
    district: "Mahbubnagar",
    crop: "Groundnut",
    variety: "Pods",
    minPrice: 6200,
    maxPrice: 7500,
    modalPrice: 6800,
    trend: "Stable",
    arrivals: 2400,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m10",
    mandi: "Badepally",
    district: "Mahbubnagar",
    crop: "Maize",
    variety: "Yellow",
    minPrice: 1950,
    maxPrice: 2250,
    modalPrice: 2100,
    trend: "Up",
    arrivals: 4100,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m11",
    mandi: "Adilabad",
    district: "Adilabad",
    crop: "Cotton",
    variety: "Long Staple",
    minPrice: 6700,
    maxPrice: 7700,
    modalPrice: 7150,
    trend: "Down",
    arrivals: 6800,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m12",
    mandi: "Adilabad",
    district: "Adilabad",
    crop: "Soybean",
    variety: "Yellow",
    minPrice: 4100,
    maxPrice: 4800,
    modalPrice: 4450,
    trend: "Stable",
    arrivals: 3900,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m13",
    mandi: "Karimnagar",
    district: "Karimnagar",
    crop: "Paddy",
    variety: "Common",
    minPrice: 2183,
    maxPrice: 2250,
    modalPrice: 2210,
    trend: "Stable",
    arrivals: 8100,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: "ts-m14",
    mandi: "Karimnagar",
    district: "Karimnagar",
    crop: "Maize",
    variety: "Yellow",
    minPrice: 1900,
    maxPrice: 2200,
    modalPrice: 2050,
    trend: "Down",
    arrivals: 3200,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
];

let telanganaMarketPrices = baselinePrices.map(item => ({
  ...item,
  lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}));

const API_URL = "https://api.data.gov.in/resource/9ef842f8-8580-4ac5-ab6b-96be3e143946";

const fetchLivePricesFromApi = async () => {
  const apiKey = import.meta.env.VITE_DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    throw new Error("No data.gov.in API key configured in .env file (VITE_DATA_GOV_IN_API_KEY)");
  }

  const response = await fetch(
    `${API_URL}?api-key=${apiKey}&format=json&limit=150&filters[state]=Telangana`
  );
  if (!response.ok) {
    throw new Error(`data.gov.in API fetch failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.records || data.records.length === 0) {
    throw new Error("No records returned from data.gov.in live API");
  }

  // Map data.gov.in records to UI schema
  return data.records.map((rec, index) => {
    const minPrice = parseInt(rec.min_price) || 0;
    const maxPrice = parseInt(rec.max_price) || 0;
    const modalPrice = parseInt(rec.modal_price) || 0;

    let trend = "Stable";
    if (maxPrice > modalPrice * 1.05) trend = "Up";
    else if (minPrice < modalPrice * 0.95) trend = "Down";

    const formatName = (str) => {
      if (!str) return "";
      return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    };

    return {
      id: `live-${index}-${rec.market}-${rec.commodity}`,
      mandi: formatName(rec.market),
      district: formatName(rec.district),
      crop: formatName(rec.commodity),
      variety: formatName(rec.variety || "Common"),
      minPrice,
      maxPrice,
      modalPrice,
      trend,
      arrivals: Math.floor(Math.random() * 8000) + 1200,
      lastUpdated: rec.arrival_date || "Today",
      isLive: true
    };
  });
};

export const fetchMarketPrices = async () => {
  try {
    const liveData = await fetchLivePricesFromApi();
    telanganaMarketPrices = liveData;
    return [...telanganaMarketPrices];
  } catch (err) {
    console.warn("Live API fetch failed, using fallback data:", err.message);
    await delay(500);
    return telanganaMarketPrices.map(item => ({ ...item, isLive: false }));
  }
};

export const fetchPreviousMarketPrices = async () => {
  try {
    const liveData = await fetchLivePricesFromApi();
    telanganaMarketPrices = liveData.map(item => ({
      ...item,
      lastUpdated: 'Saturday (Closing)'
    }));
    return [...telanganaMarketPrices];
  } catch (err) {
    console.warn("Live previous prices fetch failed, using fallback data:", err.message);
    await delay(600);
    telanganaMarketPrices = baselinePrices.map(item => ({
      ...item,
      lastUpdated: 'Saturday (Closing)',
      isLive: false
    }));
    return [...telanganaMarketPrices];
  }
};

export const refreshMarketPrices = async () => {
  try {
    const liveData = await fetchLivePricesFromApi();
    telanganaMarketPrices = liveData;
    return [...telanganaMarketPrices];
  } catch (err) {
    console.warn("Live API refresh failed, applying fluctuation to fallback data:", err.message);
    await delay(1000);
    telanganaMarketPrices = telanganaMarketPrices.map((item) => {
      const changePercent = (Math.random() * 5.5 - 2.5) / 100;
      const newModal = Math.round(item.modalPrice * (1 + changePercent));
      const newMin = Math.round(item.minPrice * (1 + changePercent * 0.85));
      const newMax = Math.round(item.maxPrice * (1 + changePercent * 1.15));
      const newArrivals = Math.max(100, Math.round(item.arrivals * (1 + (Math.random() * 12 - 6) / 100)));
      
      let trend = "Stable";
      if (changePercent > 0.007) trend = "Up";
      else if (changePercent < -0.007) trend = "Down";

      return {
        ...item,
        minPrice: newMin,
        maxPrice: newMax,
        modalPrice: newModal,
        arrivals: newArrivals,
        trend,
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isLive: false
      };
    });
    return [...telanganaMarketPrices];
  }
};

export const generateHistoricalTrend = (modalPrice, trend) => {
  // Generate 7 days of historical modal prices
  const factor = trend === "Up" ? 0.985 : trend === "Down" ? 1.015 : 1.0;
  const history = [];
  let currentVal = modalPrice;
  
  for (let i = 0; i < 7; i++) {
    history.unshift(Math.round(currentVal));
    currentVal = currentVal * (factor + (Math.random() * 0.02 - 0.01));
  }
  return history;
};

