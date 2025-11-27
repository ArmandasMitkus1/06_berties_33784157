// routes/main.js
const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// -------------------------
// OPTIONAL CONFIG (Ensure your main application code sets basePath correctly)
// -------------------------
const shopData = {
  shopName: 'Bertie’s Books',
  basePath: '', // This should be set by the calling file (index.js)
};

// -------------------------
// AUTHORISATION MIDDLEWARE
// -------------------------
const redirectLogin = (req, res, next) => {
    // FIX: Check for the existence of req.session first
    if (!req.session || !req.session.userId) {
      res.redirect(shopData.basePath + '/login');
    } else {
      next();
    }
};

// -------------------------
// SECURITY HELPERS
// -------------------------
const sanitizeBookData = (req, book) => {
  if (!book) return null;
  return {
    id: book.id,
    name: req.sanitize(book.name),
    price: book.price,
  };
};

// -------------------------
// ROUTES
// -------------------------
router.get('/', (req, res) => res.render('index', shopData));
router.get('/about', (req, res) => res.render('about', shopData));
router.get('/search', (req, res) => res.render('search', shopData));

// REGISTER
router.get('/register', (req, res) => res.render('register', shopData));

router.post(
  '/registered',
  [
    check('email').isEmail(),
    check('username').isLength({ min: 5, max: 20 }).trim().escape(),
    check('password').isLength({ min: 8 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Failed:', errors.array());
      return res.render('register', shopData);
    }

    const first = req.sanitize(req.body.first);
    const last = req.sanitize(req.body.last);
    const email = req.sanitize(req.body.email);
    const username = req.sanitize(req.body.username);
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) return res.send('Error hashing password');

      const sql = `
        INSERT INTO users (username, first_name, last_name, email, hashedPassword)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(sql, [username, first, last, email, hashedPassword], (err2) => {
        if (err2) return res.send('Error saving user: ' + err2);

        res.send(`
          <h1>Registration Successful</h1>
          <p>Hello ${first} ${last}, you are now registered.</p>
          <p>Your username is <strong>${username}</strong>.</p>
          <p><a href="${shopData.basePath}/login">Go to login</a></p>
        `);
      });
    });
  }
);

// LOGIN
router.get('/login', (req, res) => res.render('login', shopData));

router.post('/loggedin', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.send('Database error');
    if (results.length === 0) {
      recordAudit(req, username, false);
      return res.send('Login failed: invalid username or password.');
    }

    const user = results[0];
    bcrypt.compare(password, user.hashedPassword, (err2, match) => {
      if (err2) return res.send('Error comparing passwords');
      if (match) {
        req.session.userId = user.username;
        recordAudit(req, username, true);
        res.send(`<h1>Login Successful</h1><p>Welcome, ${user.first_name}!</p>`);
      } else {
        recordAudit(req, username, false);
        res.send('Login failed: invalid username or password.');
      }
    });
  });
});

// USERS LIST (Protected)
router.get('/users/list', redirectLogin, (req, res) => {
  db.query('SELECT username, first_name, last_name, email FROM users', (err, results) => {
    if (err) return res.send('Error fetching users');
    const sanitizedUsers = results.map((u) => ({
      username: req.sanitize(u.username),
      first_name: req.sanitize(u.first_name),
      last_name: req.sanitize(u.last_name),
      email: req.sanitize(u.email),
    }));
    res.render('users_list', { users: sanitizedUsers, shopName: shopData.shopName });
  });
});

// BOOK LIST
router.get('/books', (req, res) => {
  db.query('SELECT id, name, price FROM books', (err, results) => {
    if (err) return res.send('Error fetching books');
    const sanitizedBooks = results.map((b) => sanitizeBookData(req, b));
    res.render('book_list', { books: sanitizedBooks, shopName: shopData.shopName });
  });
});

// BOOK DETAIL
router.get('/books/:id', (req, res) => {
  const bookId = req.sanitize(req.params.id);
  db.query('SELECT id, name, price FROM books WHERE id = ?', [bookId], (err, results) => {
    if (err || results.length === 0) return res.send('Book not found');
    const sanitizedBook = sanitizeBookData(req, results[0]);
    res.render('book_detail', { book: sanitizedBook, shopName: shopData.shopName });
  });
});

// SEARCH RESULT
router.get('/search-result', (req, res) => {
  const keyword = req.sanitize(req.query.keyword);
  const sql = 'SELECT * FROM books WHERE name LIKE ?';
  db.query(sql, [`%${keyword}%`], (err, results) => {
    if (err) return res.send('Error during search');
    const sanitizedResults = results.map((b) => sanitizeBookData(req, b));
    res.render('search-results', {
      results: sanitizedResults,
      shopName: shopData.shopName,
      keyword,
    });
  });
});

// LOGOUT
router.get('/logout', redirectLogin, (req, res) => {
    // FIX: Add error handling callback and ensure res.send is inside the callback
    req.session.destroy(err => {
        if (err) {
            console.error('Session destruction error:', err);
            // Redirect to base path on error
            return res.redirect(shopData.basePath + '/'); 
        }
        res.send(`You are now logged out. <a href="${shopData.basePath}/">Home</a>`);
    });
});

// AUDIT VIEW
router.get('/audit', redirectLogin, (req, res) => {
  db.query('SELECT * FROM login_audit ORDER BY ts DESC', (err, results) => {
    if (err) return res.send('Error fetching audit log');
    res.render('audit', { entries: results, shopName: shopData.shopName });
  });
});

// AUDIT HELPER
function recordAudit(req, username, success) {
  const sanitizedUsername = req.sanitize(username);
  const sanitizedUa = req.sanitize(req.headers['user-agent'] || '');
  const ip = req.ip;
  const sql = `
    INSERT INTO login_audit (username, success, ip_address, user_agent)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [sanitizedUsername, success ? 1 : 0, ip, sanitizedUa], (err) => {
    if (err) console.error('Error saving audit record:', err);
  });
}

module.exports = router;