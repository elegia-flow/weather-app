// Function for temperature conversion
export function convertTemperature(temp, unit = 'C') {
    if (unit === 'C') {
        return Math.round(temp);
    }
    return celsiusToFahrenheit(temp);
}

// Function for converting wind TO all units of measurement
export function convertWind(speed, unit = 'C') {
    if (unit === 'F') {
        return Math.round(speed * 2.237) + " mph";
    }

    const userLang = navigator.language.toLowerCase();

    if (userLang.startsWith('ru') || userLang.startsWith('be') || userLang.startsWith('uk') || userLang.startsWith('kk')) {
        return Math.round(speed) + " m/s";
    }

    return Math.round(speed * 3.6) + " km/h";
}

// Function for searching countries
export function resolveSearchLocation(input, geoDataset) {
    if (!geoDataset || geoDataset.length === 0) {
        return input;
    }

    const query = input.trim().toLowerCase();
    const matchedCountry = geoDataset.find(item =>
        item.country.toLowerCase() === query ||
        item.code.toLowerCase() === query
    );

    if (matchedCountry) {
        return matchedCountry.capital;
    }

    return input;
}

// Function for Celsius to Fahrenheit conversion
export function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9 / 5) + 32);
}