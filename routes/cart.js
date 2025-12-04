module.exports = function(router, shopData) {

    // 🔹 Ensure cart exists
    function initCart(req) {
        if (!req.session.cart) req.session.cart = [];
    }

    // ---------------------------------------------------------
    // ADD TO CART
    // ---------------------------------------------------------
    router.get('/cart/add/:id', (req, res) => {
        initCart(req);
        const bookId = req.params.id;

        // Check if already exists → increase quantity
        const existing = req.session.cart.find(item => item.id == bookId);
        if (existing) {
            existing.qty++;
        } else {
            req.session.cart.push({ id: bookId, qty: 1 });
        }
        
        res.redirect('/cart');
    });


    // ---------------------------------------------------------
    // VIEW CART
    // ---------------------------------------------------------
    router.get('/cart', (req, res) => {
        initCart(req);

        if (req.session.cart.length === 0) {
            return res.send(`<h1>Your cart is empty 🛒</h1><a href="/books">Browse books</a>`);
        }

        res.render('cart', {
            items: req.session.cart,
            shopName: shopData.shopName
        });
    });


    // ---------------------------------------------------------
    // REMOVE ITEM
    // ---------------------------------------------------------
    router.get('/cart/remove/:id', (req, res) => {
        initCart(req);
        req.session.cart = req.session.cart.filter(item => item.id != req.params.id);
        res.redirect('/cart');
    });


    // ---------------------------------------------------------
    // CLEAR CART
    // ---------------------------------------------------------
    router.get('/cart/clear', (req, res) => {
        req.session.cart = [];
        res.redirect('/cart');
    });

};
