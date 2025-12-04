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
// SHOP CONFIG  (YOU ARE HERE /usr/428)
// -----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: "/usr/428"   // 🔥 THIS FIXES NAVIGATION
};

// -----------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 10 }
}));

app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(shopData.basePath, express.static(__dirname + "/public"));

// -----------------------------------------------------
// VIEW ENGINE
// -----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// -----------------------------------------------------
// ROUTES
// -----------------------------------------------------
const router = require("express").Router();

require("./routes/main")(router, shopData);    // pages
require("./routes/cart")(router, shopData);    // 🛒 LAB 10 (bonus)
require("./routes/api")(router, shopData);     // 🔥 NEW LAB 9
require("./routes/weather")(router, shopData); // 🔥 NEW LAB 9

app.use(shopData.basePath, router);

// HOME REDIRECT
app.get("/", (req, res) => res.redirect(shopData.basePath + "/"));

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(port, () => console.log(`🔥 Live → http://doc.gold.ac.uk/usr/428/`));
