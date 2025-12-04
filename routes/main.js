module.exports = (router, shopData) => {

    // Home page
    router.get("/", (req, res) => {
      res.render("index", { shopName: shopData.shopName, basePath: shopData.basePath });
    });
  
    // Books list
    router.get("/books", (req, res) => {
      db.query("SELECT * FROM books", (err, results) => {
        if (err) throw err;
        res.render("books_list", { books: results, shopName: shopData.shopName, basePath: shopData.basePath });
      });
    });
  
    // Book detail
    router.get("/books/:id", (req, res) => {
      const bookId = req.params.id;
      db.query("SELECT * FROM books WHERE id = ?", [bookId], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
          res.render("book_detail", { book: results[0], shopName: shopData.shopName, basePath: shopData.basePath });
        } else {
          res.send("Book not found");
        }
      });
    });
  
  };
  