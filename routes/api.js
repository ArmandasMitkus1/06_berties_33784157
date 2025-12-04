const express = require("express");
const axios = require("axios");
require('dotenv').config();

module.exports = (router, shopData) => {

    // GET request — show the weather page initially
    router.get("/weather", (req, res) => {
        res.render("weather", { 
            shopName: shopData.shopName, 
            basePath: shopData.basePath,
            weather: null
        });
    });

    // POST request — fetch weather for city entered by user
    router.post("/weather", async (req, res) => {
        const city = req.body.city || "London";  // default if no input
        const apiKey = process.env.OWM_API_KEY;

        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
            );
            const data = response.data;

            const weather = {
                city: data.name,
                temp: data.main.temp,
                humidity: data.main.humidity,
                description: data.weather[0].description
            };

            res.render("weather", { 
                shopName: shopData.shopName, 
                basePath: shopData.basePath,
                weather
            });

        } catch (error) {
            console.error("Error fetching weather:", error.message);
            res.render("weather", { 
                shopName: shopData.shopName, 
                basePath: shopData.basePath,
                weather: null,
                error: "City not found or API error"
            });
        }
    });

};
