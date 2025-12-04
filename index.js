const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressSanitizer = require("express-sanitizer");
require("dotenv").config();

const app = express();
const port = 8000;

// Database pool setup
const mysql = require("mysql2");
const db = mysql.createPool({
  host: process.env.BB_HOST,
  user: process.env.BB_USER,
  password: process.env.BB_PASSWORD,
  database: process.env.BB_DATABASE
});
global.db = db;

// Shop data
const shopData = {
  shopName: "Bertie's Books",
  basePath: ""
};

// Middleware
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 }
}));
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// View engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Mount routes
const router = require("express").Router();

// Main pages (login/register/books/cart/etc)
require("./routes/main")(router, shopData);

// API routes
require("./routes/api")(router, shopData);

app.use("/", router);

// Start server
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
