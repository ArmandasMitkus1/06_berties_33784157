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
// SHOP SETTINGS (BACK TO NORMAL 🔥)
//-----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: "" // no /usr/428 - we confirmed this works
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
// ROUTES — stable, working routes only
//-----------------------------------------------------
const router = require("express").Router();
require("./routes/main")(router, shopData);

app.use("/", router);

//-----------------------------------------------------
// START
//-----------------------------------------------------
app.listen(port, () => {
  console.log("🔥 Server live on port " + port);
});
