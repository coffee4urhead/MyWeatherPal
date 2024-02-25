// server.js
const dotenv = require('dotenv');
dotenv.config();

const fetch = require('cross-fetch');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('views'));

app.get('/apiResp/:city/:date', async (req, res) => {
    try {
        const { city, date } = req.params;
        const apiKey = process.env.API_KEY;
        const metricSystemApplied = "&units=metric";

        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}${metricSystemApplied}`);
        const weatherData = await weatherResponse.json();

        const secondAPIKey = process.env.SECOND_API;
        const secondWeatherResponse = await fetch(`https://api.weatherapi.com/v1/history.json?key=${secondAPIKey}&q=${city}&dt=${date}`);
        const secondWeatherData = await secondWeatherResponse.json();

        res.json({ weatherData, secondWeatherData });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`App listening at port ${PORT}`);
});
