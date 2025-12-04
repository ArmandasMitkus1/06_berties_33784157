module.exports = function(router, shopData) {

    // Return all books in JSON
    router.get("/api/books", (req, res) => {
        db.query("SELECT * FROM books", (err, rows) => {
            if (err) return res.json({ error: err });
            res.json(rows);
        });
    });

    // Search books ?q=
    router.get("/api/books/search", (req, res) => {
        const q = req.query.q || "";
        db.query("SELECT * FROM books WHERE name LIKE ?", [`%${q}%`], (err, rows) => {
            res.json(rows);
        });
    });

    // Single book by ID
    router.get("/api/books/:id", (req, res) => {
        db.query("SELECT * FROM books WHERE id=?", [req.params.id], (err, rows) => {
            if (!rows.length) return res.json({ error:"Not found" });
            res.json(rows[0]);
        });
    });
};
