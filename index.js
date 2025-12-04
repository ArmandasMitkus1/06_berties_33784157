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
// SHOP CONFIG  << THIS IS WHAT DEPLOY SERVER USES
// -----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: "/usr/428"        // <<< DO NOT CHANGE
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

// static files MUST sit under the same basePath
app.use(shopData.basePath, express.static(__dirname + "/public"));

// -----------------------------------------------------
// VIEW ENGINE
// -----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", ejs.renderFile);

// -----------------------------------------------------
// ROUTES  << THIS WAS THE BROKEN PART — NOW FIXED
// -----------------------------------------------------
const router = express.Router();
const mainRoutes = require("./routes/main");

// load routes into router
mainRoutes(router, shopData);

// MOUNT ROUTES UNDER BASE PATH
app.use(shopData.basePath, router);

// redirect raw domain → correct basePath
app.get("/", (req, res) => {
  res.redirect(shopData.basePath + "/");
});

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server running on port ${port}`);
  console.log(`Open locally: http://localhost:${port}${shopData.basePath}`);
});
