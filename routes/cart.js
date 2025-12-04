module.exports = function(router, shopData) {
    const redirectLogin = (req, res, next) => {
      if (!req.session?.userId) return res.redirect("/login");
      next();
    };
  
    router.get("/cart", redirectLogin, (req, res) => {
      if (!req.session.cart) req.session.cart = [];
      res.render("cart", { cart: req.session.cart, shopName: shopData.shopName, basePath: shopData.basePath });
    });
  
    router.get("/cart/add/:id", redirectLogin, (req, res) => {
      if (!req.session.cart) req.session.cart = [];
      req.session.cart.push({ id: req.params.id });
      res.redirect("/cart");
    });
  
    router.get("/cart/remove/:id", redirectLogin, (req, res) => {
      if (!req.session.cart) req.session.cart = [];
      req.session.cart = req.session.cart.filter(b => b.id != req.params.id);
      res.redirect("/cart");
    });
  };
  