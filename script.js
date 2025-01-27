const apiKey = 'bf25780592263dd7adee5ff588bb890b';
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherToday = document.getElementById('weather-today');
const forecastContainer = document.getElementById('forecast');
const recentSearches = document.getElementById('recent-searches');
const suggestions = document.getElementById('suggestions');
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('forecast-modal').classList.add('hidden');
});
let recentCities = [];

async function getWeatherData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    return response.json();
}

async function getForecastData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    return response.json();
}

function updateRecentSearches(city) {
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        if (recentCities.length > 5) {
            recentCities.shift();
        }
    }
    displaySuggestions();
}

function displaySuggestions() {
    suggestions.innerHTML = recentCities.map(city => `
        <div class="cursor-pointer hover:bg-blue-100 p-2" onclick="selectSuggestion('${city}')">${city}</div>
    `).join('');
}

function selectSuggestion(city) {
    cityInput.value = city;
    suggestions.innerHTML = '';
    searchWeather(city);
}

function searchWeather(city) {
    if (city) {
        getWeatherData(city).then(todayWeather => {
            getForecastData(city).then(forecastWeather => {
                displayTodayWeather(todayWeather);
                displayForecast(forecastWeather);
                updateRecentSearches(city);
            });
        });
    }
}
function displayTodayWeather(data) {
    const iconClass = getWeatherIcon(data.weather[0].main);
    weatherToday.innerHTML =  `
    <h2 class="text-2xl">${data.name}</h2>
    <i class="${iconClass} text-5xl"></i>
    <p>${data.weather[0].description}</p>
    <p>Temperature: ${data.main.temp}°C</p>
`;
}

function getWeatherIcon(condition) {
    switch (condition) {
        case 'Clear':
            return 'wi wi-day-sunny';
        case 'Clouds':
            return 'wi wi-cloudy';
        case 'Rain':
            return 'wi wi-rain';
        case 'Drizzle':
            return 'wi wi-sprinkle';
        case 'Thunderstorm':
            return 'wi wi-thunderstorm';
        case 'Snow':
            return 'wi wi-snow';
        case 'Mist':
            return 'wi wi-fog';
        default:
            return 'wi wi-na';
    }
}

function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';
    const uniqueDates = new Set();
    recentForecast = forecastData.list; // Store the forecast data

    forecastData.list.forEach(item => {
        const iconClass = getWeatherIcon(item.weather[0].main);

        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!uniqueDates.has(date)) {
            uniqueDates.add(date);
            forecastContainer.innerHTML +=  `
            <div class="bg-white p-4 rounded shadow hover:bg-blue-50 cursor-pointer" onclick="displayDailyForecast('${date}', recentForecast)">
                <h3>${date}</h3>
                <i class="${iconClass} text-3xl"></i>
                <p>${item.weather[0].description}</p>
                <p>Temp: ${item.main.temp}°C</p>
            </div>
        `;
        }
    });
}
function displayDailyForecast(date,forecastData) {
    const forecastItem = forecastData.find(item => new Date(item.dt * 1000).toLocaleDateString() === date);
    if (forecastItem) {
        const iconClass = getWeatherIcon(forecastItem.weather[0].main);
        const details = `
            <p class="text-lg font-bold">Temperature: ${forecastItem.main.temp}°C</p>
            <p>Humidity: ${forecastItem.main.humidity}%</p>
            <p>Wind Speed: ${forecastItem.wind.speed} m/s</p>
            <p>Description: ${forecastItem.weather[0].description}</p>
            <i class="${iconClass} text-5xl"></i>
        `;
        
        document.getElementById('modal-date').innerText = date;
        document.getElementById('modal-details').innerHTML = details;
        document.getElementById('forecast-modal').classList.remove('hidden');
    }
}


function updateRecentSearches(city) {
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        if (recentCities.length > 5) {
            recentCities.shift();
        }
    }
    recentSearches.innerHTML = `<h3>Recent Searches:</h3><ul>${recentCities.map(city => `<li>${city}</li>`).join('')}</ul>`;
}

searchBtn.addEventListener('click', async () => {
    const city = cityInput.value;
    if (city) {
        const todayWeather = await getWeatherData(city);
        const forecastWeather = await getForecastData(city);

        displayTodayWeather(todayWeather);
        displayForecast(forecastWeather);
        updateRecentSearches(city);
    }
});

// Get weather for current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayTodayWeather(data);
        const forecastData = await getForecastData(data.name);
        displayForecast(forecastData);
    });
}
