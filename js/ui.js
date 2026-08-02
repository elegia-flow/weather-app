import { 
    convertTemperature, 
    convertWind,
    celsiusToFahrenheit
} from "./utils.js";

// Function for showing weather icons
export function getWeatherIcon(weatherType) {
    if (weatherType.main === 'Rain' && (weatherType.id === 500 || (weatherType.id >= 520 && weatherType.id <= 522))) {
        return 'assets/weatherIcons/LightRain.svg';
    }

    if (weatherType.main === 'Snow' && (weatherType.id === 600 || weatherType.id === 612 || weatherType.id === 620)) {
        return 'assets/weatherIcons/LightSnow.svg';
    }

    return "assets/weatherIcons/" + weatherType.main + ".svg"
}

// Function for rendering the clock
export function renderHours(hourlyItems, closestHourString, unit = 'C') {
    const hourlyContainer = document.getElementById("hourlyCard");
    
    hourlyContainer.innerHTML = "";

    for (let hourPoint of hourlyItems) {
        let timeText = hourPoint.dt_txt.split(" ")[1].substring(0, 5); 
        let tempText = convertTemperature(hourPoint.main.temp, unit);

        const hourCard = document.createElement("div");
        hourCard.classList.add("hourCard");

        hourCard.dataset.rawTemp = hourPoint.main.temp;

        hourCard.innerHTML = `
            <p>${timeText}</p>
            <span>${tempText}°</span>
        `;

        if (hourPoint.dt_txt === closestHourString) {
            hourCard.classList.add("active-hour"); 
        }

        hourCard.addEventListener("click", () => {
            const hourWeather = hourPoint.weather[0];
            document.getElementById("mainWeatherIcon").src = getWeatherIcon(hourWeather);

            const fahrenheitBtn = document.getElementById("fahrenheit");
            const currentUnit = fahrenheitBtn && fahrenheitBtn.classList.contains("active-unit") ? 'F' : 'C';

            updateWeatherUI(hourPoint, currentUnit);

            document.querySelectorAll(".hourCard").forEach(h => h.classList.remove("active-hour"));
            hourCard.classList.add("active-hour");
        });

        hourlyContainer.appendChild(hourCard);
    }
}

// Function for the forecast card
export function renderForecastCard(forecastData, unit = 'C') {

    const list = forecastData.list;
    const container = document.getElementById("forecastCard");

    container.innerHTML = ""; 

    let days = {};
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let item of list) {
        let date = item.dt_txt.split(" ")[0];

        if (!days[date]) {
            days[date] = [];
        }

        days[date].push(item);
    }

    let forecastResult = [];

    for (let date in days) {

        let temps = days[date];

        let dayIndex = new Date(date).getDay();

        let dayName = weekDays[dayIndex];

        let onlyTemps = temps.map(point => point.main.temp);
        let max = Math.max(...onlyTemps);
        let min = Math.min(...onlyTemps);

        forecastResult.push({
            day: dayName,
            max,
            min,
            allHours: temps
        });
    }

    for (let day of forecastResult) {

        const card = document.createElement("div");
        const dayWeatherType = day.allHours[0].weather[0];

        card.classList.add("dayCard");
        card.style.cursor = "pointer";

        card.innerHTML = `
            <p>${day.day}</p>
            <img src="${getWeatherIcon(dayWeatherType)}" class="dayCardIcon" alt="weather">
            <div class="tempRow">
            <span class="max">${convertTemperature(day.max, unit)}°</span>
            <span class="min">${convertTemperature(day.min, unit)}°</span>
            </div>
        `;

        card.dataset.rawMax = day.max;
        card.dataset.rawMin = day.min;

        card.addEventListener("click", () => {

            const fahrenheitBtn = document.getElementById("fahrenheit");
            const activeUnit = fahrenheitBtn && fahrenheitBtn.classList.contains("active-unit") ? 'F' : 'C';

            const currentHour = new Date().getHours();

            let allPoint = day.allHours[0];

            let startHour = parseInt(allPoint.dt_txt.split(" ")[1].split(":")[0]);
            let minDifference = Math.abs(startHour - currentHour);

            for (let hourPoint of day.allHours) {

                let timePart = hourPoint.dt_txt.split(" ")[1];
                let forecastHour = parseInt(timePart.split(":")[0]);
                let currentDifference = Math.abs(forecastHour - currentHour);

                if (currentDifference < minDifference) {
                    minDifference = currentDifference;
                    allPoint = hourPoint;
                }
            }

            const currentMainWeather = allPoint.weather[0];
            document.getElementById("mainWeatherIcon").src = getWeatherIcon(currentMainWeather);

            const tempElement = document.getElementById("temperature");

            if (tempElement) {
                tempElement.dataset.rawTemp = allPoint.main.temp;
            }   

            updateWeatherUI(allPoint, activeUnit);

            document.querySelectorAll(".dayCard").forEach(c => c.classList.remove("active-day"));
            card.classList.add("active-day");

            renderHours(day.allHours, allPoint.dt_txt, activeUnit);
        });

        container.appendChild(card);
    }

    const firstDayCard = container.querySelector(".dayCard");
    if (firstDayCard) firstDayCard.click();

    document.getElementById("hourlyCard").style.display = "flex";
}

// Function for clearing the UI
export function clearUI(geoData) {
    if (!geoData || geoData.length === 0) {
        const input = document.getElementById("cityInput");
        input.classList.add("error");

        setTimeout(() => {input.classList.remove("error")}, 1000);

        document.getElementById("temperatureBlock").style.display = "none";
        document.getElementById("forecastCard").style.display = "none";
        document.getElementById("hourlyCard").style.display = "none";

        document.getElementById("units").style.display = "none";
        
        document.getElementById("cityMain").textContent = "";
        document.getElementById("temperature").textContent = "";
        document.getElementById("precipitation").textContent = "";
        document.getElementById("humidity").textContent = "";
        document.getElementById("windSpeed").textContent = "";
        document.getElementById("pressure").textContent = "";

        document.getElementById("cityMain").textContent = "";
        document.getElementById("countryName").textContent = "";

        document.getElementById("weatherCard").style.backgroundImage = "none";

        return true;
    }

    return false;
}

export function locationBlock(data, cityName, state) {
    const countryName = data.sys.country;

    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const countryMain = regionNames.of(countryName);

    document.getElementById("cityMain").textContent = cityName;

    // If the API returned a state (relevant for the US), display it separated by a comma
    if (countryName === "US") {
        document.getElementById("countryName").textContent = `${state}, ${countryMain}`;
    } else {
        document.getElementById("countryName").textContent = countryMain;
    }

    // Displaying flags
    const flagEl = document.getElementById("countryFlag");
    const codeLower = countryName.toLowerCase();
    const flagPath = `./assets/packFlags/${codeLower}.svg`;

    flagEl.src = flagPath;
    flagEl.style.display = "inline-block";
}

// Function for updating the weather in the main card
export function updateWeatherUI(data, unit = 'C') {
    document.getElementById("temperatureBlock").style.display = "flex";
    document.getElementById("forecastCard").style.display = "flex";  
    document.getElementById("units").style.display = "flex";

    let precipitation = Math.round((data.pop || 0) * 100);
    let pressure = data.main.pressure;
    let pressureMmHg = Math.round(pressure * 0.750064);

    const tempElement = document.getElementById("temperature");
    if (tempElement) {
        tempElement.dataset.rawTemp = data.main.temp;
    }

    const windElement = document.getElementById("windSpeed");
    if (windElement) {
        windElement.dataset.rawWind = data.wind.speed;
    }

    document.getElementById("temperature").textContent = convertTemperature(data.main.temp, unit);
    document.getElementById("precipitation").textContent = `Chance of rain: ${precipitation}%`;
    document.getElementById("humidity").textContent = "Humidity: " + data.main.humidity + "%";
    windElement.textContent = "Wind: " + convertWind(data.wind.speed, unit);
    document.getElementById("pressure").textContent = `Pressure: ${pressure} hPa / ${pressureMmHg} mmHg`;

    return {
        temp: data.main.temp,
        wind: data.wind.speed
    };
}

// Function to update button highlighting only
export function updateUnitButtons(currentUnit) {
    const celsiusBtn = document.getElementById("celsius");
    const fahrenheitBtn = document.getElementById("fahrenheit");

    if (currentUnit === 'C') {
        celsiusBtn.classList.add("active-unit");
        fahrenheitBtn.classList.remove("active-unit");
    } else {
        celsiusBtn.classList.remove("active-unit");
        fahrenheitBtn.classList.add("active-unit");
    }
}

// Function that instantly translates ALL elements on the screen WITHOUT resetting the clock
export function updateAllTemperaturesAfterUnitChange(currentUnit) {
    const tempElement = document.getElementById("temperature");

    if (tempElement && tempElement.dataset.rawTemp) {
        const rawTemp = parseFloat(tempElement.dataset.rawTemp);
        tempElement.textContent = convertTemperature(rawTemp, currentUnit);
    }

    const allDayCards = document.querySelectorAll(".dayCard");
    allDayCards.forEach(card => {
        const maxSpan = card.querySelector(".max");
        const minSpan = card.querySelector(".min");
        
        if (card.dataset.rawMax && card.dataset.rawMin) {
            maxSpan.textContent = `${convertTemperature(parseFloat(card.dataset.rawMax), currentUnit)}°`;
            minSpan.textContent = `${convertTemperature(parseFloat(card.dataset.rawMin), currentUnit)}°`;
        }
    });

    const allHourCards = document.querySelectorAll(".hourCard");
    allHourCards.forEach(card => {
        const hourSpan = card.querySelector("span"); 
        
        if (card.dataset.rawTemp && hourSpan) {
            hourSpan.textContent = `${convertTemperature(parseFloat(card.dataset.rawTemp), currentUnit)}°`;
        }
    });

    const windElement = document.getElementById("windSpeed");

    if (windElement && windElement.dataset.rawWind) {
        const rawWind = parseFloat(windElement.dataset.rawWind);
        windElement.textContent = "Wind: " + convertWind(rawWind, currentUnit);
    }
}