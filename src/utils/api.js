import mockData from '../data/mockData.json';

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWeather = async () => {
  await delay(800);
  return mockData.weather;
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
