const axios = require("axios");
require('dotenv').config();

module.exports = (router, shopData) => {

    // GET form
    router.get("/weather", (req, res) => {
        res.render("weather", {
            shopName: shopData.shopName,
            basePath: shopData.basePath,
            weather: null
        });
    });

    // POST city search
    router.post("/weather", async (req, res) => {
        try {
            const city = req.body.city || "London"; // default to London
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

            res.render("weather", {
                shopName: shopData.shopName,
                basePath: shopData.basePath,
                weather,
                error: null
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
