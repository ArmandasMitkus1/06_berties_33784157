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
// APP
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
// REQUIRED FOR DOC.GOLD SERVER ❗
//-----------------------------------------------------
const shopData = {
  shopName: "Bertie's Books",
  basePath: "/usr/428"   // <── FIX THAT MAKES LINKS WORK
};

//-----------------------------------------------------
// MIDDLEWARE
//-----------------------------------------------------
app.use(session({
  secret: "somerandomstuff",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 10 }
}));

app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

//-----------------------------------------------------
// VIEWS
//-----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//-----------------------------------------------------
// ROUTES
//-----------------------------------------------------
const Router = require("express").Router;
const router = Router();

require("./routes/main")(router, shopData);
require("./routes/cart")(router, shopData); // LAB 9

app.use(shopData.basePath, router); // <── MOUNTED CORRECTLY

//-----------------------------------------------------
// SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🔥 Running at http://localhost:${port}${shopData.basePath}`);
});
