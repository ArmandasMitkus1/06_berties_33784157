const axios = require("axios");

module.exports = function(router, shopData) {

    // Weather Route
    router.get("/weather", async (req, res) => {

        if (!req.query.city)
            return res.render("weather.ejs", { shopName: shopData.shopName });

        const city = req.query.city;

        try {
            // step 1: get lat/lon
            const geo = await axios.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
            );

            const location = geo.data.results?.[0];
            if (!location) return res.send("City not found");

            // step 2: get weather data
            const weatherAPI = await axios.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m`
            );

            const w = weatherAPI.data.current;

            res.render("weather.ejs", {
                shopName: shopData.shopName,
                weather: {
                    city,
                    temp: w.temperature_2m,
                    wind: w.wind_speed_10m,
                    humidity: w.relative_humidity_2m
                }
            });

        } catch (err) {
            res.send("Weather API Error ❌");
        }

    });
};
