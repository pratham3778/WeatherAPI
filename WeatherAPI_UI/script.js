// API Configuration
const API_BASE_URL = "http://localhost:8080/weather/forecast";

// State
let currentWeatherData = null;
let currentChartType = "temperature";

// DOM Elements
const searchForm = document.getElementById("searchForm");
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const daysInput = document.getElementById("daysInput");
const errorMessage = document.getElementById("errorMessage");
const loadingState = document.getElementById("loadingState");
const weatherDisplay = document.getElementById("weatherDisplay");
const newSearchBtn = document.getElementById("newSearchBtn");
const feedbackBtn = document.getElementById("feedbackBtn");
const feedbackModal = document.getElementById("feedbackModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const copyEmailBtn = document.getElementById("copyEmailBtn");

// Weather Icons SVG paths
const weatherIcons = {
  sunny: `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `,
  cloudy: `
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
    `,
  rainy: `
        <line x1="16" y1="13" x2="16" y2="21"></line>
        <line x1="8" y1="13" x2="8" y2="21"></line>
        <line x1="12" y1="15" x2="12" y2="23"></line>
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
    `,
};

// Event Listeners
weatherForm.addEventListener("submit", handleFormSubmit);
newSearchBtn.addEventListener("click", handleNewSearch);
feedbackBtn.addEventListener("click", openFeedbackModal);
modalClose.addEventListener("click", closeFeedbackModal);
modalOverlay.addEventListener("click", closeFeedbackModal);
copyEmailBtn.addEventListener("click", copyEmailToClipboard);

// Handle Form Submit
async function handleFormSubmit(e) {
  e.preventDefault();

  const city = cityInput.value.trim();
  const days = daysInput.value;

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  hideError();
  await fetchWeather(city, days);
}

// Fetch Weather Data
async function fetchWeather(city, days) {
  showLoading();

  try {
    const url = `${API_BASE_URL}?city=${encodeURIComponent(city)}&days=${days}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Failed to fetch weather data. Please check if the API is running."
      );
    }

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    hideLoading();
    showError(error.message);
    console.error("Error fetching weather:", error);
  }
}

// Display Weather Data
function displayWeather(data) {
  hideLoading();

  // Store data globally
  currentWeatherData = data;

  const { weatherResponse, dayTemp } = data;

  // Update city name
  document.getElementById(
    "cityName"
  ).textContent = `${weatherResponse.city}, ${weatherResponse.region}`;

  // Update current temperature
  document.getElementById("currentTemp").textContent = Math.round(
    weatherResponse.temperature
  );

  // Update weather situation
  document.getElementById("weatherSituation").textContent =
    weatherResponse.situation;

  // Update weather icon
  updateWeatherIcon("currentWeatherIcon", weatherResponse.situation);

  // Draw temperature chart (default)
  currentChartType = "temperature";
  drawTemperatureChart(dayTemp);

  // Display forecast days
  displayForecastDays(dayTemp, weatherResponse.situation);

  // Setup chart tabs
  setupChartTabs();

  // Show weather display
  searchForm.style.display = "none";
  weatherDisplay.style.display = "block";
}

// Update Weather Icon
function updateWeatherIcon(elementId, situation) {
  const iconElement = document.getElementById(elementId);
  const situationLower = situation.toLowerCase();

  let iconPath = weatherIcons.sunny;
  if (situationLower.includes("cloud")) {
    iconPath = weatherIcons.cloudy;
  } else if (situationLower.includes("rain")) {
    iconPath = weatherIcons.rainy;
  }

  iconElement.innerHTML = iconPath;
}

// Setup Chart Tabs
function setupChartTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      tabButtons.forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      btn.classList.add("active");

      // Switch chart type
      if (index === 0) {
        currentChartType = "temperature";
        drawTemperatureChart(currentWeatherData.dayTemp);
      } else if (index === 1) {
        currentChartType = "precipitation";
        drawPrecipitationChart(currentWeatherData.dayTemp);
      } else if (index === 2) {
        currentChartType = "wind";
        drawWindChart(currentWeatherData.dayTemp);
      }
    });
  });
}

// Draw Temperature Chart
function drawTemperatureChart(dayTemp) {
  const svg = document.getElementById("tempChart");
  svg.innerHTML = "";

  const temps = dayTemp.map((d) => d.avgTemp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempRange = maxTemp - minTemp || 1;

  // Create gradient
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const gradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  gradient.setAttribute("id", "tempGradient");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "0%");
  gradient.setAttribute("y2", "100%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#FEF3C7");
  stop1.setAttribute("stop-opacity", "0.6");

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#FEF3C7");
  stop2.setAttribute("stop-opacity", "0.1");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  // Calculate points
  const points = dayTemp.map((day, i) => {
    const x = (i / (dayTemp.length - 1)) * 800;
    const y = 120 - (((day.avgTemp - minTemp) / tempRange) * 80 + 20);
    return { x, y, temp: day.avgTemp };
  });

  // Create area path
  let areaPath = `M 0,${points[0].y} `;
  points.forEach((p) => {
    areaPath += `L ${p.x},${p.y} `;
  });
  areaPath += `L 800,120 L 0,120 Z`;

  const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
  area.setAttribute("d", areaPath);
  area.setAttribute("fill", "url(#tempGradient)");
  svg.appendChild(area);

  // Create line path
  let linePath = `M 0,${points[0].y} `;
  points.forEach((p) => {
    linePath += `L ${p.x},${p.y} `;
  });

  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("d", linePath);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#FBBF24");
  line.setAttribute("stroke-width", "3");
  svg.appendChild(line);

  // Add points and labels
  points.forEach((p) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "4");
    circle.setAttribute("fill", "#FBBF24");
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", p.x);
    text.setAttribute("y", p.y - 15);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#6B7280");
    text.setAttribute("font-size", "14");
    text.setAttribute("font-weight", "500");
    text.textContent = `${Math.round(p.temp)}°`;
    svg.appendChild(text);
  });
}

// Draw Precipitation Chart
function drawPrecipitationChart(dayTemp) {
  const svg = document.getElementById("tempChart");
  svg.innerHTML = "";

  // Simulated precipitation data (you can replace with actual API data if available)
  const precipData = dayTemp.map((_, i) => ({
    value: Math.random() * 20, // 0-20mm
    date: dayTemp[i].date,
  }));

  const maxPrecip = Math.max(...precipData.map((d) => d.value), 1);

  // Create gradient for precipitation
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const gradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  gradient.setAttribute("id", "precipGradient");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "0%");
  gradient.setAttribute("y2", "100%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#93C5FD");
  stop1.setAttribute("stop-opacity", "0.6");

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#93C5FD");
  stop2.setAttribute("stop-opacity", "0.1");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  // Draw bars
  precipData.forEach((data, i) => {
    const x = (i / (precipData.length - 1)) * 800;
    const barWidth = 60;
    const barHeight = (data.value / maxPrecip) * 80;
    const y = 120 - barHeight;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x - barWidth / 2);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", "url(#precipGradient)");
    rect.setAttribute("rx", "4");
    svg.appendChild(rect);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 10);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#6B7280");
    text.setAttribute("font-size", "14");
    text.setAttribute("font-weight", "500");
    text.textContent = `${data.value.toFixed(1)}mm`;
    svg.appendChild(text);
  });
}

// Draw Wind Chart
function drawWindChart(dayTemp) {
  const svg = document.getElementById("tempChart");
  svg.innerHTML = "";

  // Simulated wind data (you can replace with actual API data if available)
  const windData = dayTemp.map((_, i) => ({
    value: Math.random() * 30 + 5, // 5-35 km/h
    date: dayTemp[i].date,
  }));

  const maxWind = Math.max(...windData.map((d) => d.value));
  const minWind = Math.min(...windData.map((d) => d.value));
  const windRange = maxWind - minWind || 1;

  // Create gradient for wind
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const gradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  gradient.setAttribute("id", "windGradient");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "0%");
  gradient.setAttribute("y2", "100%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#A5F3FC");
  stop1.setAttribute("stop-opacity", "0.6");

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#A5F3FC");
  stop2.setAttribute("stop-opacity", "0.1");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  // Calculate points
  const points = windData.map((data, i) => {
    const x = (i / (windData.length - 1)) * 800;
    const y = 120 - (((data.value - minWind) / windRange) * 80 + 20);
    return { x, y, value: data.value };
  });

  // Create area path
  let areaPath = `M 0,${points[0].y} `;
  points.forEach((p) => {
    areaPath += `L ${p.x},${p.y} `;
  });
  areaPath += `L 800,120 L 0,120 Z`;

  const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
  area.setAttribute("d", areaPath);
  area.setAttribute("fill", "url(#windGradient)");
  svg.appendChild(area);

  // Create line path
  let linePath = `M 0,${points[0].y} `;
  points.forEach((p) => {
    linePath += `L ${p.x},${p.y} `;
  });

  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("d", linePath);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#06B6D4");
  line.setAttribute("stroke-width", "3");
  svg.appendChild(line);

  // Add points and labels
  points.forEach((p) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "4");
    circle.setAttribute("fill", "#06B6D4");
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", p.x);
    text.setAttribute("y", p.y - 15);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#6B7280");
    text.setAttribute("font-size", "14");
    text.setAttribute("font-weight", "500");
    text.textContent = `${Math.round(p.value)}km/h`;
    svg.appendChild(text);
  });
}

// Display Forecast Days
function displayForecastDays(dayTemp, situation) {
  const forecastGrid = document.getElementById("forecastDays");
  forecastGrid.innerHTML = "";

  // Set grid columns based on number of days
  const cols =
    dayTemp.length <= 3
      ? "cols-3"
      : dayTemp.length <= 4
      ? "cols-4"
      : dayTemp.length <= 5
      ? "cols-5"
      : "cols-7";
  forecastGrid.className = `forecast-grid ${cols}`;

  dayTemp.forEach((day, index) => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    const dayName = getDayName(day.date);

    card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon-container">
                <svg class="forecast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${getWeatherIconPath(situation)}
                </svg>
            </div>
            <div class="forecast-temps">
                <span class="forecast-temp-max">${Math.round(
                  day.maxTemp
                )}°</span>
                <span class="forecast-temp-min">${Math.round(
                  day.minTemp
                )}°</span>
            </div>
        `;

    forecastGrid.appendChild(card);
  });
}

// Get Day Name from Date
function getDayName(dateString) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(dateString);
  return days[date.getDay()];
}

// Get Weather Icon Path
function getWeatherIconPath(situation) {
  const situationLower = situation.toLowerCase();
  if (situationLower.includes("cloud")) {
    return weatherIcons.cloudy;
  } else if (situationLower.includes("rain")) {
    return weatherIcons.rainy;
  }
  return weatherIcons.sunny;
}

// Handle New Search
function handleNewSearch() {
  weatherDisplay.style.display = "none";
  searchForm.style.display = "flex";
  cityInput.value = "";
  hideError();
}

// Show/Hide Loading State
function showLoading() {
  searchForm.style.display = "none";
  loadingState.style.display = "flex";
}

function hideLoading() {
  loadingState.style.display = "none";
}

// Show/Hide Error
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  searchForm.style.display = "flex";
}

function hideError() {
  errorMessage.style.display = "none";
}

// Feedback Modal Functions
function openFeedbackModal() {
  feedbackModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeFeedbackModal() {
  feedbackModal.style.display = "none";
  document.body.style.overflow = "auto";

  // Reset copy button if it was changed
  const copyBtn = document.getElementById("copyEmailBtn");
  const copyBtnText = document.getElementById("copyBtnText");
  copyBtn.classList.remove("copied");
  copyBtnText.textContent = "Copy Email";
}

function copyEmailToClipboard() {
  const email = "pratham3778@gmail.com";
  const copyBtn = document.getElementById("copyEmailBtn");
  const copyBtnText = document.getElementById("copyBtnText");

  // Copy to clipboard
  navigator.clipboard
    .writeText(email)
    .then(() => {
      // Change button appearance
      copyBtn.classList.add("copied");
      copyBtnText.textContent = "Copied!";

      // Reset after 2 seconds
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtnText.textContent = "Copy Email";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy email:", err);
      alert("Failed to copy email. Please copy manually: " + email);
    });
}
