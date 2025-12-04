module.exports = (router, shopData) => {

    // WEATHER ROUTE
    router.get("/weather", (req, res) => {
  
      // Example weather data
      const weatherData = {
        city: "London",
        temp: 12,
        humidity: 80
      };
  
      res.render("weather", {
        weather: weatherData,
        shopName: shopData.shopName,
        basePath: shopData.basePath
      });
    });
  
  };
  