// routes/main.js

module.exports = function (app, shopData) {

  // -------------------------
  // IMPORT MODULES 
  // -------------------------
  const { check, validationResult } = require('express-validator');
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  
  // -------------------------
  // AUTHORISATION MIDDLEWARE (Lab 8a, Task 3)
  // -------------------------
  const redirectLogin = (req, res, next) => {
    if (!req.session.userId) { 
        res.redirect('/login') 
    } else {
        next();
    }
  }

  // -------------------------
  // SECURITY HELPERS (XSS Fixes for Database Reads)
  // -------------------------

  // Helper to sanitize book database results (used by book list/detail/search)
  const sanitizeBookData = (book) => {
    if (!book) return null;
    return {
      id: book.id,
      name: req.sanitize(book.name),
      price: book.price
      // Sanitize other string fields as necessary
    };
  };

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
    res.render('register', shopData); 
  });

  // -------------------------
  // HANDLE REGISTRATION (Lab 8b: Validation and Sanitisation)
  // -------------------------
  app.post('/registered', 
    // Validation Middleware (Lab 8b, Tasks 2 & 3)
    [ 
        check('email').isEmail(),
        check('username').isLength({ min: 5, max: 20}).trim().escape(), 
        check('password').isLength({ min: 8 }) 
    ], 
    (req, res) => {

    // 1. Check for errors from validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Failed:", errors.array());
      return res.render('register', shopData); 
    }
    
    // 2. Apply Sanitisation (Lab 8b, Task 7) - AFTER validation passes
    // NOTE: req.sanitize is available because app.use(expressSanitizer()) is in index.js
    const first = req.sanitize(req.body.first);
    const last = req.sanitize(req.body.last);
    const email = req.sanitize(req.body.email);
    const username = req.sanitize(req.body.username);
    const password = req.body.password; // Do not sanitize password

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
          
          // ADDITION: Save user session here, when login is successful
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
  app.get('/users/list', redirectLogin, (req, res) => { 
    db.query(
      'SELECT username, first_name, last_name, email FROM users',
      (err, results) => {
        if (err) {
          console.error(err);
          return res.send('Error fetching users');
        }
        
        // FIX: Sanitize all user data fields before rendering to prevent XSS
        const sanitizedUsers = results.map(user => ({
            username: req.sanitize(user.username),
            first_name: req.sanitize(user.first_name),
            last_name: req.sanitize(user.last_name),
            email: req.sanitize(user.email)
        }));

        res.render('users_list', { users: sanitizedUsers, shopName: shopData.shopName });
      }
    );
  });
  
  // -------------------------
  // LOGOUT ROUTE (Lab 8a, Task 4)
  // -------------------------
  app.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => { 
        if (err) {
            return res.redirect('./') 
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
  });

  // -------------------------
  // AUDIT LOG VIEW (Protected for security/compliance)
  // -------------------------
  app.get('/audit', redirectLogin, (req, res) => { // ADDITION: Protected by redirectLogin
    db.query(
      'SELECT * FROM login_audit ORDER BY ts DESC',
      (err, results) => {
        if (err) {
          console.error(err);
          return res.send('Error fetching audit log');
        }
        res.render('audit', { entries: results, shopName: shopData.shopName });
      }
    );
  });

  // -------------------------
  // AUDIT HELPER FUNCTION (Security Fix)
  // -------------------------
  function recordAudit(username, success, req) {
    // FIX: Sanitize the username and user-agent before saving to prevent XSS in audit log
    const sanitizedUsername = req.sanitize(username); 
    const sanitizedUa = req.sanitize(req.headers['user-agent'] || ''); 
    
    const ip = req.ip;
    const sql = `
      INSERT INTO login_audit (username, success, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `;
    // Use sanitized variables for the query:
    db.query(sql, [sanitizedUsername, success ? 1 : 0, ip, sanitizedUa], (err) => {
      if (err) console.error('Error saving audit record:', err);
    });
  }

}; // END module.exports