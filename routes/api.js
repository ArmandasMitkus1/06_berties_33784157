const axios = require("axios");
require("dotenv").config();

module.exports = (router, shopData) => {

    // GET default weather page
    router.get("/weather", (req, res) => {
        res.render("weather", { weather: null, shopName: shopData.shopName, basePath: shopData.basePath });
    });

    // POST city input
    router.post("/weather", async (req, res) => {
        try {
            const city = req.body.city;
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

            res.render("weather", { weather, shopName: shopData.shopName, basePath: shopData.basePath });

        } catch (error) {
            console.error("Error fetching weather:", error.message);
            res.render("weather", { weather: null, shopName: shopData.shopName, basePath: shopData.basePath });
        }
    });
};
