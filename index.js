//-----------------------------------------------------
// IMPORTS
//-----------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); 
const expressSanitizer = require('express-sanitizer');
require('dotenv').config();

//-----------------------------------------------------
// INITIALISE SERVER
//-----------------------------------------------------
const app = express();
const port = 8000;

//-----------------------------------------------------
// VIEW ENGINE
//-----------------------------------------------------
app.set('view engine', 'ejs');

//-----------------------------------------------------
// DATABASE (if needed later)
//-----------------------------------------------------
const mysql = require('mysql2');
const db = mysql.createPool({
  host: process.env.BB_HOST,
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
// ROUTES
//-----------------------------------------------------
const router = require("express").Router();
require("./routes/api")(router, shopData);
app.use("/", router);

//-----------------------------------------------------
// START SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Server live on port ${port}`);
});
