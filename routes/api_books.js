module.exports = function(router) {

    // Get all books
    router.get("/api/books", (req, res) => {
      db.query("SELECT id, name, price FROM books", (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
      });
    });
  
    // Get a single book by ID
    router.get("/api/books/:id", (req, res) => {
      const bookId = req.params.id;
      db.query("SELECT id, name, price FROM books WHERE id=?", [bookId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!rows.length) return res.status(404).json({ error: "Book not found" });
        res.json(rows[0]);
      });
    });
  
  };
  