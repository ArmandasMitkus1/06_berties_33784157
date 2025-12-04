const axios = require("axios");

module.exports = function (router, shopData) {

  router.get("/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) return res.send("Please provide a city in the query, e.g., ?city=London");

    const apiKey = process.env.OWM_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const weather = {
        city: data.name,
        temp: data.main.temp,
        desc: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`
      };

      res.render("weather", { shopName: shopData.shopName, weather });
    } catch (err) {
      console.error(err);
      res.send("Error fetching weather data. Make sure the city exists and API key is valid.");
    }
  });

};
