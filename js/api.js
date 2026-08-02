import { API_KEY } from "./config.js";
const BASE_URL = "https://api.openweathermap.org";

// 1. Fetching local dataset with cities
export async function getGeoDataset() {
    const response = await fetch("./data/geoDataset.json");
    return await response.json();
}

// 2. Getting coordinates by city name
export async function getCoordinates(city) {
    const url = `${BASE_URL}/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`;
    const response = await fetch(url);
    return await response.json();
}

// 3. Getting current weather by latitude and longitude
export async function getWeather(lat, lon) {
    const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${API_KEY}`;
    const response = await fetch(url);
    return await response.json();
}

// 4. Getting 5-day weather forecast by latitude and longitude
export async function getForecast(lat, lon) {
    const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${API_KEY}`;
    const response = await fetch(url);
    return await response.json();
}