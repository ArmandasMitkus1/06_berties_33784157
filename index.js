//-----------------------------------------------------
// IMPORTS
//-----------------------------------------------------
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session"); 
const expressSanitizer = require("express-sanitizer");
require('dotenv').config();

//-----------------------------------------------------
// INITIALISE SERVER
//-----------------------------------------------------
const app = express();
const port = 8000;

//-----------------------------------------------------
// DATABASE POOL
//-----------------------------------------------------
const mysql = require("mysql2");
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
  basePath: "" // root path
};

//-----------------------------------------------------
// MIDDLEWARE
//-----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 } // 10 min
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
const Router = require("express").Router;
const router = Router();

// Shop & auth routes
require("./routes/main")(router, shopData);

// Weather routes
require("./routes/weather")(router, shopData);

// API routes (Lab 9b)
require("./routes/api")(router, shopData);

app.use("/", router);

//-----------------------------------------------------
// START SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
