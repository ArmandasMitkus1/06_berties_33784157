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

  // ABOUT PAGE
  app.get('/about', (req, res) => {
    res.render('about', shopData);
  });

  // SEARCH PAGE
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
  // HANDLE REGISTRATION
  // -------------------------
  app.post('/registered', (req, res) => {
    const { first, last, email } = req.body;

    // Generate simple username and password for now
    const username = email.split('@')[0];
    const plainPassword = 'password123';

    bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.send('Error hashing password.');
      }

      const sql = `
        INSERT INTO users (username, first_name, last_name, email, hashedPassword)
        VALUES (?, ?, ?, ?, ?)
      `;

      shopData.db.query(sql, [username, first, last, email, hashedPassword], (err2) => {
        if (err2) {
          console.error(err2);
          return res.send('Error saving registration: ' + err2.message);
        }

        res.send(`
          <h1>Registration Successful ✅</h1>
          <p>Hello ${first} ${last}, you are now registered.</p>
          <p>Your username is <strong>${username}</strong> and a default password (<i>password123</i>) was securely hashed.</p>
          <p><a href="/">⬅ Back to Home</a></p>
        `);
      });
    });
  });

  // -------------------------
  // BOOK LIST PAGE
  // -------------------------
  app.get('/books', (req, res) => {
    const sql = 'SELECT * FROM books';
    shopData.db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching books');
      }
      res.render('books_list', { ...shopData, books: results });
    });
  });

  // -------------------------
  // INDIVIDUAL BOOK PAGE
  // -------------------------
  app.get('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = 'SELECT * FROM books WHERE id = ?';
    shopData.db.query(sql, [bookId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching book');
      }
      res.render('book_detail', { ...shopData, book: results[0] });
    });
  });
};
