const axios = require("axios");

module.exports = (router, shopData) => {

  // GET weather page with search form
  router.get("/weather", (req, res) => {
    res.render("weather", { shopName: shopData.shopName, basePath: shopData.basePath, result: null });
  });

  // POST weather search
  router.post("/weather", async (req, res) => {
    try {
      const city = req.body.city;
      const apiKey = process.env.OWM_API_KEY;

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

      const response = await axios.get(url);
      const data = response.data;

      const weather = {
        city: data.name,
        temp: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description
      };

      res.render("weather", { shopName: shopData.shopName, basePath: shopData.basePath, result: weather });

    } catch (error) {
      console.error("Weather API error:", error.message);
      res.render("weather", { shopName: shopData.shopName, basePath: shopData.basePath, result: null, error: "City not found" });
    }
  });

};
