module.exports = function(router) {
    router.get("/api/books", (req, res) => {
      db.query("SELECT id, name, price FROM books", (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
      });
    });
  };
  