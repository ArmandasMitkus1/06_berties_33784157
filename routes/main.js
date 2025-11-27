// routes/main.js

module.exports = function (app, shopData) {

  // -------------------------
  // IMPORT MODULES (Lab 8b, Task 1)
  // -------------------------
  const { check, validationResult } = require('express-validator'); 
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  
  // -------------------------
  // AUTHORISATION MIDDLEWARE (Lab 8a, Task 3)
  // -------------------------
  const redirectLogin = (req, res, next) => {
    // Check if the user ID is in the session
    if (!req.session.userId) { 
        res.redirect('/login') // Redirect to the login page if not logged in
    } else {
        next(); // Move to the next middleware function (the route handler)
    }
  }

  // -------------------------
  // HOME PAGE
  // -------------------------
  app.get('/', (req, res) => {
    res.render('index', shopData);
  });

  // (Optional) ABOUT PAGE
  app.get('/about', (req, res) => {
    res.render('about', shopData);
  });

  // (Optional) SEARCH PAGE
  app.get('/search', (req, res) => {
    res.render('search', shopData);
  });

  // -------------------------
  // REGISTER FORM
  // -------------------------
  app.get('/register', (req, res) => {
    // Pass errors object if needed, but for simplicity, we'll just redirect to the form
    res.render('register', shopData); 
  });

  // -------------------------
  // HANDLE REGISTRATION (Lab 8b: Validation and Sanitisation)
  // -------------------------
  app.post('/registered', 
    // Validation Middleware (Lab 8b, Tasks 2 & 3)
    [ 
        check('email').isEmail(),
        check('username').isLength({ min: 5, max: 20}).trim().escape(), // Added trim/escape for basic sanitisation before DB (Good Practice)
        check('password').isLength({ min: 8 }) // REQUIRED ADDITION: Password minimum length
    ], 
    (req, res) => {

    // 1. Check for errors from validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, return to registration page
      console.log("Validation Failed:", errors.array());
      // In a real app, you'd pass errors back to the template
      return res.render('register', shopData); 
    }
    
    // 2. Apply Sanitisation (Lab 8b, Task 7) - AFTER validation passes
    // NOTE: req.sanitize is available because you added app.use(expressSanitizer()) in index.js
    const first = req.sanitize(req.body.first);
    const last = req.sanitize(req.body.last);
    const email = req.sanitize(req.body.email);
    const username = req.sanitize(req.body.username);
    const password = req.body.password; // Do not sanitize password (it will be hashed)

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.send('Error hashing password');
      }

      const sql = `
        INSERT INTO users (username, first_name, last_name, email, hashedPassword)
        VALUES (?, ?, ?, ?, ?)
      `;

      // Use the sanitized variables (first, last, email, username) for DB insertion
      db.query(sql, [username, first, last, email, hashedPassword], (err2) => {
        if (err2) {
          console.error(err2);
          // In a real app, check for unique key constraint error (e.g., username/email already exists)
          return res.send('Error saving user: ' + err2);
        }

        res.send(`
          <h1>Registration Successful</h1>
          <p>Hello ${first} ${last}, you are now registered.</p>
          <p>Your username is <strong>${username}</strong>. Your password has been securely hashed.</p>
          <p><a href="/login">Go to login</a></p>
        `);
      });
    });
  });

  // -------------------------
  // LOGIN FORM
  // -------------------------
  app.get('/login', (req, res) => {
    res.render('login', shopData);
  });

  // -------------------------
  // HANDLE LOGIN (Lab 8a, Task 3: Save Session)
  // -------------------------
  app.post('/loggedin', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        console.error(err);
        return res.send('Database error');
      }

      if (results.length === 0) {
        recordAudit(username, false, req);
        return res.send('Login failed: invalid username or password.');
      }

      const user = results[0];

      bcrypt.compare(password, user.hashedPassword, (err2, match) => {
        if (err2) {
          console.error(err2);
          return res.send('Error comparing passwords');
        }

        if (match) {
          recordAudit(username, true, req);
          
          // ADDITION: Save user session here, when login is successful (Lab 8a, Task 3)
          req.session.userId = user.username; 
          
          res.send(`<h1>Login Successful</h1><p>Welcome, ${user.first_name}!</p>`);
        } else {
          recordAudit(username, false, req);
          res.send('Login failed: invalid username or password.');
        }
      });
    });
  });

  // -------------------------
  // USERS LIST (PROTECTED) (Lab 8a, Task 3)
  // -------------------------
  app.get('/users/list', redirectLogin, (req, res) => { // ADDITION: Protected by redirectLogin
    db.query(
      'SELECT username, first_name, last_name, email FROM users',
      (err, results) => {
        if (err) {
          console.error(err);
          return res.send('Error fetching users');
        }
        res.render('users_list', { users: results, shopName: shopData.shopName });
      }
    );
  });
  
  // -------------------------
  // LOGOUT ROUTE (Lab 8a, Task 4)
  // -------------------------
  app.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => { // Destroy the session
        if (err) {
            return res.redirect('./') 
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
  });

  // -------------------------
  // AUDIT LOG VIEW
  // -------------------------
  app.get('/audit', (req, res) => {
    db.query(
      'SELECT * FROM login_audit ORDER BY ts DESC',
      (err, results) => {
        if (err) {
          console.error(err);
          return res.send('Error fetching audit log');
        }
        res.render('audit', { entries: results