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
// SHOP CONFIG — FINAL VERSION
// -----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: ""   // Running at root: https://doc.gold.ac.uk/usr/428/
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

// Serve static files normally (works in browser now)
app.use(express.static(__dirname + "/public"));

// -----------------------------------------------------
// VIEW ENGINE
// -----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", ejs.renderFile);

// -----------------------------------------------------
// ROUTES — FIXED (NO MORE router.post ERROR 🔥)
// -----------------------------------------------------
const expressRouter = require("express").Router;  // create router correctly
const mainRoutes = require("./routes/main");

const router = expressRouter();
mainRoutes(router, shopData);

app.use("/", router);   // Mount properly at root

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
