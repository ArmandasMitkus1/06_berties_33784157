// ---------------------------------------------
// IMPORT MODULES
// ---------------------------------------------
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require('dotenv').config();

// ---------------------------------------------
// CREATE EXPRESS APP
// ---------------------------------------------
const app = express();
const port = 8000;

// ---------------------------------------------
// LOG STARTUP
// ---------------------------------------------
console.log('✅ Starting Bertie\'s Books server...');
console.log('🔍 Checking database connection...');

// ---------------------------------------------
// SETUP MYSQL CONNECTION POOL
// ---------------------------------------------
const db = mysql.createPool({
  host: process.env.BB_HOST || 'localhost',
  user: process.env.BB_USER,
  password: process.env.BB_PASSWORD,
  database: process.env.BB_DATABASE
});

// Test DB connection immediately
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:');
    console.error(err);
    process.exit(1); // Stop if we can’t connect
  } else {
    console.log('✅ Connected to MySQL successfully.');
    connection.release();
  }
});

// Make the db global for route access
global.db = db;

// ---------------------------------------------
// MIDDLEWARE
// ---------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// ---------------------------------------------
// VIEW ENGINE
// ---------------------------------------------
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

// ---------------------------------------------
// TEMPLATE DATA
// ---------------------------------------------
const shopData = { shopName: "Bertie's Books" };

// ---------------------------------------------
// ROUTES
// ---------------------------------------------
require('./routes/main')(app, shopData);

// ---------------------------------------------
// START SERVER
// ---------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Example app listening on http://localhost:${port}/`);
});
