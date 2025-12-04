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
// INITIALISE APP
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
// GLOBAL SHOP SETTINGS
//-----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: ""   // 👈 root path (no /usr/428 needed)
};

//-----------------------------------------------------
// MIDDLEWARE
//-----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 10 } // 10min session
}));

app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public")); // CSS, images, JS

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

// main routing file
require("./routes/main")(router, shopData);

// 🛒 Shopping Cart (lab 9)
require("./routes/cart")(router, shopData);

app.use("/", router); // mount everything at root

//-----------------------------------------------------
// START SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
