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
      // For Lab 9, store full book info instead of just id
      db.query("SELECT id, name, price FROM books WHERE id=?", [req.params.id], (err, rows) => {
        if (rows?.length) req.session.cart.push(rows[0]);
        res.redirect("/cart");
      });
    });
  
    router.get("/cart/remove/:id", redirectLogin, (req, res) => {
      if (!req.session.cart) req.session.cart = [];
      req.session.cart = req.session.cart.filter(b => b.id != req.params.id);
      res.redirect("/cart");
    });
  };
  