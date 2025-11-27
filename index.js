// ---------------------------------------------
// IMPORT MODULES
// ---------------------------------------------
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session'); 
const expressSanitizer = require('express-sanitizer');
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

// Make the db global for route access
global.db = db;

// ---------------------------------------------
// MIDDLEWARE
// ---------------------------------------------
// TEMPLATE DATA (Defining basePath for VM navigation)
// ---------------------------------------------
const shopData = { 
    shopName: "Bertie's Books",
    // CRITICAL: Base path must be defined here for routing and links
    basePath: '/usr/428' 
};

// Session Middleware (Lab 8a)
app.use(session({
    secret: 'somerandomstuff', 
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000 
    }
}));

// Sanitisation Middleware (Lab 8b, Task 6)
app.use(expressSanitizer()); 

app.use(bodyParser.urlencoded({ extended: true }));

// FIX 1: Mount static files at the BASE PATH
app.use(shopData.basePath, express.static(__dirname + '/public')); 

// ---------------------------------------------
// VIEW ENGINE
// ---------------------------------------------
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

// ---------------------------------------------
// ROUTES (Router Mounting Fix)
// ---------------------------------------------

// 1. Require the routes function
const mainRoutes = require('./routes/main'); 

// 2. Create an Express Router instance
const router = express.Router(); 

// 3. Pass the Router instance and shopData to the main.js function
mainRoutes(router, shopData);

// 4. Mount the Router instance at the required BASE PATH
app.use(shopData.basePath, router); 

// 5. CRITICAL FIX: Handle generic root access
app.use('/', (req, res) => {
    res.redirect(shopData.basePath + '/');
});

// ---------------------------------------------
// START SERVER
// ---------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Example app listening on http://localhost:${port}/`);
});