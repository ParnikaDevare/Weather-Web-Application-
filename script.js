const apiKey = "ebc8813c6255bf68795d30a602323392"; 
let language = "english"; 

window.onload = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            getWeatherByCoords(lat, lon);
        });
    }
};

function manualSearch() {
    const city = document.getElementById('cityInput').value.trim();
    if (city === "") return alert(text("Enter city name"));
    getWeatherByCity(city);
}

function toggleLanguage() {
    language = language === "english" ? "hindi" : "english";
    document.querySelector("button[onclick='toggleLanguage()']").innerText =
        language === "english" ? "Switch to Hindi" : "Switch to English";
}

function getWeatherByCity(city) {
    showLoader();
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            hideLoader();
            if (data.cod !== 200) return alert(text("City not found"));
            updateUI(data);
            getAQI(data.coord.lat, data.coord.lon);
            getForecast(data.coord.lat, data.coord.lon);
        })
        .catch(err => {
            hideLoader();
            alert("Error fetching data");
        });
}

function getWeatherByCoords(lat, lon) {
    showLoader();
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            hideLoader();
            if (data.cod !== 200) return;
            updateUI(data);
            getAQI(lat, lon);
            getForecast(lat, lon);
        })
        .catch(err => hideLoader());
}

function updateUI(data) {
    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById("weatherResult").innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${icon}">
        <p>${text("Temperature")}: ${data.main.temp}°C</p>
        <p>${data.weather[0].description}</p>
        <p>${text("Humidity")}: ${data.main.humidity}%</p>
        <p>${text("Wind Speed")}: ${data.wind.speed} m/s</p>
    `;
    suggestActivity(data.main.temp, data.weather[0].description);
    updateBackgroundAnimated(data.weather[0].description);
}

function getAQI(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            const aqi = data.list[0].main.aqi;
            const quality = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
            const hindiQuality = ["अच्छी", "ठीक", "मध्यम", "खराब", "बहुत खराब"];
            const tip = [
                "Enjoy your day!",
                "Acceptable air quality.",
                "Reduce prolonged outdoor activities.",
                "Limit outdoor exertion.",
                "Avoid outdoor activities."
            ];
            const hindiTip = [
                "बिलकुल बाहर जा सकते हैं।",
                "हवा की गुणवत्ता ठीक है।",
                "लंबे समय तक बाहर रुकने से बचें।",
                "बाहर जाना टालें।",
                "घर पर रहें, मास्क पहनें।"
            ];

            document.getElementById("aqiResult").innerHTML = `
                <h3>${text("Air Quality")}:</h3>
                <p>${language === "hindi" ? hindiQuality[aqi - 1] : quality[aqi - 1]}</p>
                <p>${language === "hindi" ? hindiTip[aqi - 1] : tip[aqi - 1]}</p>
            `;
        });
}

function getForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            let forecastHTML = `<h3>${text("7-Day Forecast")}:</h3>`;
            data.daily.slice(0, 7).forEach(day => {
                const date = new Date(day.dt * 1000);
                forecastHTML += `
                    <div>
                        <p>${date.toDateString()}</p>
                        <p>${text("Day")}: ${day.temp.day}°C</p>
                        <p>${text("Night")}: ${day.temp.night}°C</p>
                        <p>${day.weather[0].description}</p>
                    </div>
                `;
            });
            document.getElementById("forecast").innerHTML = forecastHTML;
        });
}

function text(eng) {
    const dict = {
        "Enter city name": "कृपया शहर का नाम दर्ज करें",
        "City not found": "शहर नहीं मिला",
        "Temperature": "तापमान",
        "Humidity": "नमी",
        "Wind Speed": "हवा की गति",
        "Air Quality": "वायु गुणवत्ता",
        "7-Day Forecast": "7-दिन का पूर्वानुमान",
        "Day": "दिन",
        "Night": "रात"
    };
    return language === "hindi" ? dict[eng] || eng : eng;
}

function updateBackgroundAnimated(desc) {
    desc = desc.toLowerCase();
    const rainContainer = document.getElementById("rainContainer");
    const snowContainer = document.getElementById("snowContainer");
    const starsContainer = document.getElementById("starsContainer");
    const rainSound = document.getElementById("rainSound");

    // Reset all effects
    rainContainer.innerHTML = "";
    snowContainer.innerHTML = "";
    starsContainer.innerHTML = "";
    rainSound.pause();
    rainSound.currentTime = 0;

    if (desc.includes("rain")) {
        document.body.style.background = "repeating-linear-gradient(45deg, #373B44, #4286f4 10px)";
        document.body.style.animation = "rainMove 1s linear infinite";
        startRain();
        rainSound.play();
    } else if (desc.includes("snow")) {
        document.body.style.background = "linear-gradient(135deg, #e0eafc, #cfdef3)";
        document.body.style.animation = "snowFall 3s linear infinite";
        startSnow();
    } else if (desc.includes("cloud")) {
        document.body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
    } else if (desc.includes("clear") && isNightTime()) {
        document.body.style.background = "linear-gradient(135deg, #000000, #0a0a23)";
        createStars();
    } else {
        document.body.style.background = "linear-gradient(135deg, #00c6ff, #0072ff)";
    }


    if (desc.includes("rain")) {
    document.body.style.background = "repeating-linear-gradient(45deg, #373B44, #4286f4 10px)";
    document.body.style.animation = "rainMove 1s linear infinite";
    startRain();
    
    const rainSound = document.getElementById("rainSound");
    rainSound.muted = false;
    rainSound.play().catch(()=>{});
}

}


function startRain() {
    const rainContainer = document.getElementById("rainContainer");
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement("div");
        drop.classList.add("raindrop");
        drop.style.left = Math.random() * window.innerWidth + "px";
        drop.style.animationDuration = (Math.random() * 1 + 0.5) + "s";
        drop.style.animationDelay = Math.random() * 2 + "s";
        rainContainer.appendChild(drop);
    }
}



function suggestActivity(temp, desc) {
    desc = desc.toLowerCase();
    let suggestion = "";
    if (desc.includes("rain") || desc.includes("storm")) {
        suggestion = language === "hindi" ? "⚠️ बाहर मत जाएं।" : "⚠️ Not suitable for outdoor activities.";
    } else if (temp >= 30) {
        suggestion = language === "hindi" ? "बहुत गर्मी है! बाहर सावधानी रखें।" : "It's hot! Stay hydrated.";
    } else if (temp >= 20) {
        suggestion = language === "hindi" ? "घूमने के लिए शानदार मौसम।" : "Great weather for walking or jogging.";
    } else {
        suggestion = language === "hindi" ? "कपड़े अच्छे से पहनें।" : "Dress warmly, it's cold.";
    }
    document.getElementById("activityResult").innerHTML = `<p>${suggestion}</p>`;
}

function showLoader() {
    document.getElementById("loader").classList.remove("hidden");
}
function hideLoader() {
    document.getElementById("loader").classList.add("hidden");
}

function startRain() {
    const rainContainer = document.getElementById("rainContainer");
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement("div");
        drop.classList.add("raindrop");
        drop.style.left = Math.random() * window.innerWidth + "px";
        drop.style.animationDuration = (Math.random() * 1 + 0.5) + "s";
        drop.style.animationDelay = Math.random() * 2 + "s";
        rainContainer.appendChild(drop);
    }
}

function startSnow() {
    const snowContainer = document.getElementById("snowContainer");
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement("div");
        flake.classList.add("snowflake");
        flake.innerText = "❄️";
        flake.style.left = Math.random() * window.innerWidth + "px";
        flake.style.animationDuration = (Math.random() * 3 + 2) + "s";
        flake.style.fontSize = (Math.random() * 10 + 10) + "px";
        snowContainer.appendChild(flake);
    }
}

function createStars() {
    const starsContainer = document.getElementById("starsContainer");
    for (let i = 0; i < 80; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.top = Math.random() * window.innerHeight + "px";
        star.style.left = Math.random() * window.innerWidth + "px";
        star.style.opacity = Math.random();
        star.style.width = star.style.height = Math.random() * 2 + "px";
        starsContainer.appendChild(star);
    }
}

function isNightTime() {
    const hour = new Date().getHours();
    return hour >= 19 || hour <= 5;
}

function manualSearch() {
    const city = document.getElementById('cityInput').value.trim();
    if (city === "") return alert(text("Enter city name"));
    getWeatherByCity(city);

    // Ensures browser allows sound after user interacts
    const rainSound = document.getElementById("rainSound");
    rainSound.muted = false;
    rainSound.play().catch(()=>{});
}
