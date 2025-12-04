const axios = require("axios");

module.exports = (router, shopData) => {

  // GET /weather page
  router.get("/weather", (req, res) => {
    res.render("weather", { shopName: shopData.shopName, basePath: shopData.basePath, weather: null, error: null });
  });

  // POST /weather search
  router.post("/weather", async (req, res) => {
    const city = req.body.city;
    const apiKey = process.env.OWM_API_KEY;

    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      const data = response.data;

      const weather = {
        city: data.name,
        temp: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description
      };

      res.render("weather", { shopName: shopData.shopName, basePath: shopData.basePath, weather, error: null });

    } catch (err) {
      console.error("Weather API error:", err.message);
      res.render("weather", { shopName: shopData.shopName, basePath: shopData.basePath, weather: null, error: "City not found" });
    }
  });

};
