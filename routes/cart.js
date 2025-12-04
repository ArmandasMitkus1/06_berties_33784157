module.exports = function(router, shopData) {

    const redirectLogin = (req, res, next) => {
      if (!req.session?.userId) return res.redirect("/login");
      next();
    };
  
    let cart = [];
  
    router.get('/cart', redirectLogin, (req, res) => {
      res.render('cart', { cart, shopName: shopData.shopName, basePath: shopData.basePath });
    });
  
    router.get('/cart/add/:id', redirectLogin, (req, res) => {
      const id = req.params.id;
      db.query("SELECT * FROM books WHERE id=?", [id], (err, rows) => {
        if (!rows?.length) return res.send("Book not found");
        cart.push(rows[0]);
        res.redirect('/cart');
      });
    });
  
    router.get('/cart/remove/:id', redirectLogin, (req, res) => {
      const id = req.params.id;
      cart = cart.filter(b => b.id != id);
      res.redirect('/cart');
    });
  
  };
  