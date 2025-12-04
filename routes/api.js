const axios = require("axios");
require('dotenv').config();

module.exports = (router, shopData) => {
  router.get("/weather", async (req, res) => {
    try {
      const city = req.query.city || "London";
      const apiKey = process.env.OWM_API_KEY;
      if (!apiKey) throw new Error("OWM_API_KEY not set in .env");

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

      const response = await axios.get(url);
      const data = response.data;

      const weather = {
        city: data.name,
        temp: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description
      };

      res.render("weather", { weather, shopName: shopData.shopName, basePath: shopData.basePath });

    } catch (err) {
      console.error("Weather API error:", err.message);
      res.render("weather", { weather: null, shopName: shopData.shopName, basePath: shopData.basePath, error: "City not found or API error" });
    }
  });
};
