const express = require("express");
const axios = require("axios");
require('dotenv').config();

module.exports = (router) => {

    // Weather route
    router.get("/weather", async (req, res) => {
        try {
            const city = "London"; // fixed city
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

            res.render("weather", { weather });

        } catch (error) {
            console.error("Error fetching weather:", error.message);
            res.render("weather", { weather: null });
        }
    });

};
