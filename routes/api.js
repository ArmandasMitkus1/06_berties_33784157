const express = require("express");
const axios = require("axios");
require("dotenv").config();

module.exports = (router) => {

    // API: GET /api/weather?city=CityName
    router.get("/api/weather", async (req, res) => {
        const city = req.query.city;

        if (!city) {
            return res.status(400).json({ error: "City parameter is required." });
        }

        try {
            const apiKey = process.env.OWM_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
            
            const response = await axios.get(url);
            const data = response.data;

            const weather = {
                city: data.name,
                temp: data.main.temp,
                humidity: data.main.humidity,
                description: data.weather[0].description
            };

            res.json({ success: true, weather });
        } catch (error) {
            console.error("Error fetching weather API:", error.message);
            res.status(500).json({ success: false, error: "Could not fetch weather data." });
        }
    });

};
