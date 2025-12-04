const axios = require("axios");
require('dotenv').config();

module.exports = function(router, shopData) {

    // Weather route
    router.get("/weather", async (req, res) => {
        const city = req.query.city || "London"; // default to London
        const apiKey = process.env.OWM_API_KEY;

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
            const response = await axios.get(url);
            const data = response.data;

            const weather = {
                city: data.name,
                temp: data.main.temp,
                humidity: data.main.humidity,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            };

            res.render("weather", {
                shopName: shopData.shopName,
                basePath: shopData.basePath,
                weather
            });

        } catch (error) {
            console.error("Error fetching weather:", error.message);

            // Send to view with null weather for proper error display
            res.render("weather", {
                shopName: shopData.shopName,
                basePath: shopData.basePath,
                weather: null
            });
        }
    });

};
