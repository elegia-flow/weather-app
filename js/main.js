import {
    getGeoDataset, 
    getCoordinates, 
    getWeather, 
    getForecast 
} from "./api.js";

import {
    resolveSearchLocation
} from "./utils.js";

import {
    renderForecastCard, 
    clearUI, 
    locationBlock, 
    updateWeatherUI,
    updateUnitButtons,
    updateAllTemperaturesAfterUnitChange
} from "./ui.js";

// DOM Elements
const input = document.getElementById("cityInput");
const button = document.getElementById("searchCity");
const celsiusBtn = document.getElementById("celsius");
const fahrenheitBtn = document.getElementById("fahrenheit");

// State variables
let currentUnit = navigator.language === 'en-US' ? 'F' : 'C';
let geoDataset = [];
let datasetReady = false;

// Initial UI State
document.getElementById("temperatureBlock").style.display = "none";
document.getElementById("forecastCard").style.display = "none";
document.getElementById("hourlyCard").style.display = "none";

// Initial button highlight
updateUnitButtons(currentUnit);

// Load Geo Dataset
getGeoDataset().then(data => {
    geoDataset = data;
    datasetReady = true;
});

// Event Listeners for Units
celsiusBtn.addEventListener("click", () => {
    if (currentUnit === 'C') return; 
    currentUnit = 'C';
    updateUnitButtons(currentUnit);
    updateAllTemperaturesAfterUnitChange(currentUnit);
});

fahrenheitBtn.addEventListener("click", () => {
    if (currentUnit === 'F') return; 
    currentUnit = 'F';
    updateUnitButtons(currentUnit);
    updateAllTemperaturesAfterUnitChange(currentUnit);
});

// Search functionality
button.addEventListener('click', async () => { 
    let city = input.value.trim();

    city = resolveSearchLocation(city, geoDataset);

    if (city === "") return;

    if (!datasetReady) {
        console.log("Wait dataset");
        return;
    }

    const spinner = document.getElementById("spinner");
    const toast = document.getElementById("toast");

    const startLoading = () => {
        if (toast) toast.classList.add("hidden");
        spinner.classList.remove("hidden");
    };

    let toastTimer;
    const showError = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove("hidden");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    };

    if (!navigator.onLine) {
        showError("No internet connection. Check your network.");
        return;
    }

    startLoading();

    try {
        const geoData = await getCoordinates(city);
        if (clearUI(geoData)) return;

        const bestLocation = geoData[0];
        const { lat, lon, state, name: cityName } = bestLocation;

        const weatherData = await getWeather(lat, lon);
        const forecastData = await getForecast(lat, lon);

        if (forecastData) {
            renderForecastCard(forecastData, currentUnit);
        }

        locationBlock(weatherData, cityName, state);
        updateWeatherUI(weatherData, currentUnit);
    } catch(error) {
        console.error("Error occurred while loading data:", error);

        if (!navigator.onLine) {
            showError("Connection lost. Please try again.");
        } else {
            showError("Unable to load weather data. Please try again.");
        }
    } finally {
        spinner.classList.add("hidden");
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'Enter') {
        button.click();
    }
});