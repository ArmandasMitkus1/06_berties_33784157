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
// INITIALISE SERVER
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
// SHOP SETTINGS
//-----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: ""
};

//-----------------------------------------------------
// MIDDLEWARE
//-----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 }
}));
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

//-----------------------------------------------------
// VIEW ENGINE
//-----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//-----------------------------------------------------
// ROUTES
//-----------------------------------------------------
const router = require("express").Router();

// Core routes
require("./routes/main")(router, shopData);

// Cart routes
require("./routes/cart")(router, shopData);

// Weather API routes
require("./routes/weather")(router, shopData);

// API routes (books)
require("./routes/api_books")(router);

app.use("/", router);

//-----------------------------------------------------
// START SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
