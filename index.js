// index.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const mainRouter = require('./routes/main'); // <- your route file

const app = express();

// ----- View Engine Setup -----
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ----- Middleware -----
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ----- Routes -----
app.use('/', mainRouter); // root route handled by main.js

// ----- 404 -----
app.use((req, res, next) => {
  res.status(404).render('error', { message: 'Page not found' });
});

// ----- Start Server -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
