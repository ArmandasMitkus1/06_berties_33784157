//-----------------------------------------------------
// IMPORTS
//-----------------------------------------------------
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session'); 
const expressSanitizer = require('express-sanitizer');
require('dotenv').config();

//-----------------------------------------------------
// INITIALISE
//-----------------------------------------------------
const app = express();
const port = 8000;

//-----------------------------------------------------
// DATABASE
//-----------------------------------------------------
const db = mysql.createPool({
  host: process.env.BB_HOST || "localhost",
  user: process.env.BB_USER,
  password: process.env.BB_PASSWORD,
  database: process.env.BB_DATABASE
});
global.db = db;

//-----------------------------------------------------
// SHOP CONFIG
//-----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: ""       // ⬅ correct for doc.gold.ac.uk/usr/428/
};

//-----------------------------------------------------
// MIDDLEWARE
//-----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 10 } // 10 min session
}));

app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));  // CSS + images

//-----------------------------------------------------
// 🔥 MAKE basePath + shopName AVAILABLE IN ALL EJS FILES
//-----------------------------------------------------
app.use((req, res, next) => {
  res.locals.basePath = shopData.basePath;
  res.locals.shopName = shopData.shopName;
  next();
});

//-----------------------------------------------------
// VIEW ENGINE
//-----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//-----------------------------------------------------
// ROUTES
//-----------------------------------------------------
const Router = require("express").Router;
const router = Router();

require("./routes/main")(router, shopData); // login/register/books/users
require("./routes/cart")(router, shopData); // 🛒 LAB 9 Shopping cart

app.use("/", router);

//-----------------------------------------------------
// START SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
