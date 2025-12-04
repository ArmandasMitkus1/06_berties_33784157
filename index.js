//-----------------------------------------------------
// IMPORTS
//-----------------------------------------------------
const express = require('express');
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
  basePath: "" // root path
};

//-----------------------------------------------------
// MIDDLEWARE
//-----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 } // 10 minutes
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

// main app routes
require("./routes/main")(router, shopData);

// API / weather route
require("./routes/api")(router, shopData);

// cart route if you have it
require("./routes/cart")(router, shopData);

app.use("/", router);

//-----------------------------------------------------
// START SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server live on http://localhost:${port}/`);
});
