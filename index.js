const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressSanitizer = require("express-sanitizer");
require("dotenv").config();

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(session({
    secret: "somerandomstuff",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }
}));
app.use(express.static(__dirname + "/public"));

// View engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Router
const router = require("express").Router();

// Load routes
require("./routes/main")(router, { shopName: "Bertie's Books", basePath: "" });
require("./routes/api")(router);  // ← Lab 9b API route

app.use("/", router);

app.listen(port, () => {
    console.log(`🔥 Server running at http://localhost:${port}/`);
});
