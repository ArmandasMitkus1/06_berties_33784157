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
        if (!req.session || !req.session.userId) {
            return res.redirect(shopData.basePath + '/login');
        }
        next();
    };

//---------------------------------------------------------
// SANITISE BOOK INFO
//---------------------------------------------------------
    const sanitizeBookData = (req, book) => {
        if (!book) return null;
        return {
            id: book.id,
            name: req.sanitize(book.name),
            price: book.price
        };
    };

//---------------------------------------------------------
// BASIC PAGES
//---------------------------------------------------------
    router.get('/', (req, res) => res.render('index', shopData));
    router.get('/about', (req, res) => res.render('about', shopData));
    router.get('/search', (req, res) => res.render('search', shopData));


//---------------------------------------------------------
// REGISTER (FIXED + CLEAN)
//---------------------------------------------------------
    router.get('/register', (req, res) => res.render('register', shopData));

    router.post('/registered',
        [
            check('email').isEmail(),
            check('username').isLength({ min: 5, max: 20 }),
            check('password').isLength({ min: 8 })
        ],
        (req, res) => {

            if (!validationResult(req).isEmpty())
                return res.render('register', shopData);

            const first = req.sanitize(req.body.first);
            const last = req.sanitize(req.body.last);
            const email = req.sanitize(req.body.email);
            const username = req.sanitize(req.body.username);
            const password = req.body.password;

            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) return res.send("Password hashing error.");

                const sql = `INSERT INTO users (username, first_name, last_name, email, hashedPassword)
                             VALUES (?, ?, ?, ?, ?)`;

                db.query(sql, [username, first, last, email, hash], (err2) => {
                    if (err2) return res.send("❌ Error saving user: " + err2);

                    res.send(`
                        <h1>Registration Successful 🎉</h1>
                        <p>Welcome <b>${first} ${last}</b></p>
                        <a href="${shopData.basePath}/login">Login Now</a>
                    `);
                });
            });
        });


//---------------------------------------------------------
// LOGIN
//---------------------------------------------------------
    router.get('/login', (req, res) => res.render('login', shopData));

    router.post('/loggedin', (req, res) => {

        const { username, password } = req.body;

        db.query("SELECT * FROM users WHERE username=?", [username], (err, rows) => {
            if (err) return res.send("Database Error");
            if (!rows.length) return res.send("❌ Invalid username or password.");

            const user = rows[0];

            bcrypt.compare(password, user.hashedPassword, (err2, match) => {
                if (!match) return res.send("❌ Invalid username or password.");

                req.session.userId = user.username;
                res.send(`<h1>Login Successful ✔</h1><p>Welcome ${user.first_name}</p>`);
            });
        });
    });


//---------------------------------------------------------
// USERS LIST (PROTECTED)
//---------------------------------------------------------
    router.get('/users/list', redirectLogin, (req, res) => {
        db.query("SELECT username, first_name, last_name, email FROM users", (err, rows) => {
            if (err) return res.send("Error fetching users");

            const safeUsers = rows.map(u => ({
                username: req.sanitize(u.username),
                first_name: req.sanitize(u.first_name),
                last_name: req.sanitize(u.last_name),
                email: req.sanitize(u.email)
            }));

            res.render("users_list", { users: safeUsers, shopName: shopData.shopName });
        });
    });


//---------------------------------------------------------
// BOOKS
//---------------------------------------------------------
    router.get('/books', (req, res) => {
        db.query("SELECT id, name, price FROM books", (err, rows) => {
            if (err) return res.send("Error fetching books");
            res.render("book_list", { books: rows.map(b => sanitizeBookData(req, b)), shopName: shopData.shopName });
        });
    });

    router.get('/books/:id', (req, res) => {
        db.query("SELECT id, name, price FROM books WHERE id=?", [req.params.id], (err, rows) => {
            if (!rows.length) return res.send("Book not found");
            res.render("book_detail", { book: sanitizeBookData(req, rows[0]), shopName: shopData.shopName });
        });
    });


//---------------------------------------------------------
// SEARCH
//---------------------------------------------------------
    router.get('/search-result', (req, res) => {
        db.query("SELECT * FROM books WHERE name LIKE ?", [`%${req.query.keyword}%`], (err, rows) => {
            res.render("search-results", {
                results: rows.map(b => sanitizeBookData(req, b)),
                shopName: shopData.shopName,
                keyword: req.query.keyword
            });
        });
    });


//---------------------------------------------------------
// LOGOUT
//---------------------------------------------------------
    router.get('/logout', redirectLogin, (req, res) => {
        req.session.destroy(() => res.redirect(shopData.basePath + "/"));
    });

};  // END MODULE
