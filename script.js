// Weather App JavaScript
const API_KEY = 'e59a563b5fed44908cb183249252406';
const BASE_URL = 'http://api.weatherapi.com/v1';

// Initialize the app
function initWeatherApp() {
    bindEvents();
    loadLastSearchedCity();
}

// Bind event listeners
function bindEvents() {
    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');
    
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('input', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
}

// Main search function
async function searchWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    if (!city) return;
    
    try {
        const searchResults = await searchCity(city);
        if (searchResults.length === 0) {
            renderError('City not found.');
            return;
        }
        const selectedCity = searchResults[0];
        await getWeatherData(selectedCity.lat, selectedCity.lon, selectedCity.name);
        localStorage.setItem('lastSearchedCity', selectedCity.name);
    } catch (error) {
        renderError('Failed to fetch weather data.');
    }
}

// Search for city
async function searchCity(query) {
    const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search city');
    return await response.json();
}

// Get weather data
async function getWeatherData(lat, lon, cityName) {
    const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3&aqi=no`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    renderWeatherCards(data, cityName);
}

// Render weather cards
function renderWeatherCards(data, cityName) {
    const container = document.getElementById('weatherCards');
    container.innerHTML = '';
    const days = data.forecast.forecastday;
    
    // Today card
    container.appendChild(createTodayCard(days[0], data.location.name, data.current));
    
    // Next 2 days
    for (let i = 1; i < days.length; i++) {
        container.appendChild(createForecastCard(days[i]));
    }
}

// Create today's weather card
function createTodayCard(day, city, current) {
    const card = document.createElement('div');
    card.className = 'col-lg-4 weather-card today';
    card.innerHTML = `
        <div class="day">${getDayName(new Date(day.date))}</div>
        <div class="date">${formatDateShort(new Date(day.date))}</div>
        <div class="city">${city}</div>
        <div class="temp">${current.temp_c}°C</div>
        <div class="icon"><img src="${getLocalIcon(current.condition.text)}" alt="icon"></div>
        <div class="desc">${current.condition.text}</div>
        <div class="details mt-3">
            <span><i class="fa-solid fa-tint"></i> ${current.humidity}%</span>
            <span><i class="fa-solid fa-wind"></i> ${current.wind_kph}km/h</span>
            <span><i class="fa-regular fa-clock"></i> ${current.wind_dir}</span>
        </div>
    `;
    return card;
}

// Create forecast card
function createForecastCard(day) {
    const card = document.createElement('div');
    card.className = 'col-lg-4 weather-card';
    card.innerHTML = `
        <div class="day">${getDayName(new Date(day.date))}</div>
        <div class="date">${formatDateShort(new Date(day.date))}</div>
        <div class="icon"><img src="${getLocalIcon(day.day.condition.text)}" alt="icon"></div>
        <div class="temp">${day.day.avgtemp_c}°C</div>
        <div class="desc">${day.day.condition.text}</div>
        <div class="details mt-3">
            <span>${Math.round(day.day.mintemp_c)}°</span>
            <span>${Math.round(day.day.maxtemp_c)}°</span>
            <span><i class="fa-solid fa-tint"></i> ${day.day.avghumidity}%</span>
        </div>
    `;
    return card;
}

// Render error message
function renderError(msg) {
    const container = document.getElementById('weatherCards');
    container.innerHTML = `<div class='text-center text-danger py-5'>${msg}</div>`;
}

// Load last searched city
function loadLastSearchedCity() {
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        document.getElementById('cityInput').value = lastCity;
        searchWeather();
    }
}

// Get day name
function getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Format date short
function formatDateShort(date) {
    return `${date.getDate()}${date.toLocaleDateString('en-US', { month: 'short' })}`;
}

// Get local icon based on condition
function getLocalIcon(conditionText) {
    if (conditionText.includes('Sunny')) return 'images/sunny-icon.png';
    if (conditionText.includes('Cloud')) return 'images/cloudy-icon.png';
    // ... add other conditions ...
    return 'images/default-icon.png';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initWeatherApp);
