require('dotenv').config();
const mysql = require('mysql2');

console.log("🔍 Testing MySQL connection using .env settings...");

const db = mysql.createConnection({
  host: process.env.BB_HOST || 'localhost',
  user: process.env.BB_USER,
  password: process.env.BB_PASSWORD,
  database: process.env.BB_DATABASE
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:");
    console.error(err);
  } else {
    console.log("✅ MySQL connection successful!");
  }
  db.end();
});
