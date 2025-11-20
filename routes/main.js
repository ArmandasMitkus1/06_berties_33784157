// routes/main.js

module.exports = function (app, shopData) {

  const bcrypt = require('bcrypt');
  const saltRounds = 10;

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
    res.render('register', shopData); // ✅ now passes shopName
  });

  // -------------------------
  // HANDLE REGISTRATION
  // -------------------------
  app.post('/registered', (req, res) => {
    const { first, last, email, username, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.send('Error hashing password');
      }

      const sql = `
        INSERT INTO users (username, first_name, last_name, email, hashedPassword)
        VALUES (?, ?, ?, ?, ?)
      `;

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
  // HANDLE LOGIN
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
          res.send(`<h1>Login Successful</h1><p>Welcome, ${user.first_name}!</p>`);
        } else {
          recordAudit(username, false, req);
          res.send('Login failed: invalid username or password.');
        }
      });
    });
  });

  // -------------------------
  // USERS LIST (NO PASSWORDS)
  // -------------------------
  app.get('/users/list', (req, res) => {
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
        res.render('audit', { entries: results, shopName: shopData.shopName });
      }
    );
  });

  // -------------------------
  // AUDIT HELPER FUNCTION
  // -------------------------
  function recordAudit(username, success, req) {
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';
    const sql = `
      INSERT INTO login_audit (username, success, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [username, success ? 1 : 0, ip, ua], (err) => {
      if (err) console.error('Error saving audit record:', err);
    });
  }

}; // END module.exports
