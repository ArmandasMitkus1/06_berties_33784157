//---------------------------------------------------------
// REQUIRED MODULES
//---------------------------------------------------------
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function (router, shopData) {

    //---------------------------------------------------------
    // LOGIN PROTECTION
    //---------------------------------------------------------
    const redirectLogin = (req, res, next) => {
        if (!req.session?.userId) return res.redirect("/login");
        next();
    };

    //---------------------------------------------------------
    // ROUTES — ALL RENDER .EJS CORRECTLY
    //---------------------------------------------------------

    router.get("/", (req,res) => {
        res.render("index.ejs", shopData);
    });

    router.get("/about", (req,res) => {
        res.render("about.ejs", shopData);
    });

    router.get("/search", (req,res) => {
        res.render("search.ejs", shopData);
    });

    router.get("/register", (req,res) => {
        res.render("register.ejs", shopData);
    });

    router.get("/login", (req,res) => {
        res.render("login.ejs", shopData);
    });


    //---------------------------------------------------------
    // USERS (protected)
    //---------------------------------------------------------
    router.get('/users/list', redirectLogin, (req, res) => {
        db.query("SELECT username, first_name, last_name, email FROM users", (err, rows) => {
            if (err) return res.send("❌ Database issue.");
            res.render("users_list.ejs", { users: rows, shopName: shopData.shopName });
        });
    });


    //---------------------------------------------------------
    // BOOKS
    //---------------------------------------------------------
    router.get('/books', (req, res) => {
        db.query("SELECT id, name, price FROM books", (err, rows) => {
            if (err) return res.send("❌ Books fetch error");
            res.render("books_list.ejs", { books: rows, shopName: shopData.shopName });
        });
    });

    router.get('/books/:id', (req, res) => {
        db.query("SELECT * FROM books WHERE id=?", [req.params.id], (err, result) => {
            if (!result.length) return res.send("Book not found.");
            res.render("book_detail.ejs", { book: result[0], shopName: shopData.shopName });
        });
    });

};
