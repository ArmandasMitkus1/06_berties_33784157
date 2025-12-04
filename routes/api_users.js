module.exports = function(router) {
    const redirectLogin = (req, res, next) => {
      if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
      next();
    };
  
    router.get("/api/users", redirectLogin, (req, res) => {
      db.query("SELECT username, first_name, last_name, email FROM users", (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
  
        const users = rows.map(u => ({
          username: u.username,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email
        }));
  
        res.json(users);
      });
    });
  };
  