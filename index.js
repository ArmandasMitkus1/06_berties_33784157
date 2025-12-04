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
// MAIN SHOP CONFIG
//-----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: ""  // Correct for DOC
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
// ROUTERS
//-----------------------------------------------------
const router = require("express").Router();
require("./routes/main")(router, shopData);     // Login, Register, Books, Users
require("./routes/cart")(router, shopData);     // Lab 8–9 Cart
require("./routes/api")(router, shopData);      // ⭐ Lab 9 API endpoint

app.use("/", router);

//-----------------------------------------------------
// SERVER START
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
