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
// SHOP CONFIG — FIX APPLIED HERE 🔥
// (Removes redirect loop + cleans URL)
// -----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: ""       // <── WAS "/usr/428", now correctly empty
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

// Static files no longer need path prefix
app.use(express.static(__dirname + "/public"));

// -----------------------------------------------------
// VIEW ENGINE
// -----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", ejs.renderFile);

// -----------------------------------------------------
// ROUTES
// -----------------------------------------------------
const router = require("./routes/main");
app.use("/", router);

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}/`);
});
