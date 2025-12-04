// -----------------------------------------------------
// IMPORTS
// -----------------------------------------------------
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session'); 
const expressSanitizer = require('express-sanitizer');
require('dotenv').config();

// -----------------------------------------------------
// INITIALISE
// -----------------------------------------------------
const app = express();
const port = 8000;

// -----------------------------------------------------
// DATABASE
// -----------------------------------------------------
const db = mysql.createPool({
  host: process.env.BB_HOST || "localhost",
  user: process.env.BB_USER,
  password: process.env.BB_PASSWORD,
  database: process.env.BB_DATABASE
});
global.db = db;

// -----------------------------------------------------
// SHOP CONFIG (DO NOT CHANGE FOR SERVER DEPLOYMENT)
// -----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: "/usr/428"
};

// -----------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { expires: 600000 }
}));

app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files under basePath
app.use(shopData.basePath, express.static(__dirname + "/public"));

// -----------------------------------------------------
// VIEW ENGINE
// -----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", ejs.renderFile);

// -----------------------------------------------------
// ROUTES  (STABLE + CORRECT)
// -----------------------------------------------------
const router = require("./routes/main");

// mount all pages under '/usr/428'
app.use(shopData.basePath, router);

// FIX — removed redirect loop
app.get("/", (req, res) => {
  res.send(`
    <h1>Server Online ✔</h1>
    <p>Your site is located here:</p>
    <a href="${shopData.basePath}/">${shopData.basePath}/</a>
  `);
});

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running: http://localhost:${port}${shopData.basePath}`);
});
