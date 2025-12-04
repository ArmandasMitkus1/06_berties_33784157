const axios = require("axios");

module.exports = function(router, shopData) {

    router.get("/weather", async (req, res) => {
        let city = req.query.city || "London"; // default city

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=0.1276&current_weather=true`;
            const response = await axios.get(url);

            const weather = {
                city: city,
                temp: response.data.current_weather.temperature,
                humidity: response.data.current_weather.relativehumidity_2m || "N/A"
            };

            res.render("weather", { shopName: shopData.shopName, weather });

        } catch (err) {
            console.log(err);
            res.render("weather", { shopName: shopData.shopName, weather: null });
        }
    });

};
