Lab 9 – APIs

This project completes Lab 9a (Calling APIs) and Lab 9b (Providing APIs) for Bertie’s Books.

What this app does
🌦 Weather Feature (Lab 9a)

Uses OpenWeatherMap API to get live weather data

Route added: /weather

User can type a city and get temperature, humidity etc.

Includes basic error handling so invalid city names don’t crash the app


Lab 9a - Calling APIs

📚 Books API (Lab 9b)

Added a new API route for developers to access book data in JSON

Route: /api/books

Queries the database and returns results as JSON


Lab 9b - Providing APIs

Extra features added

Better formatting for weather results

Weather page link added to homepage

Optional API search/sort/price parameters (if completed)

How to run
npm install
node app.js
# or on VM
forever start app.js

Required URLs for submission
Feature	URL
Home	/
Weather Page	/weather
Books API	/api/books

If you want, I can also generate a final links.txt + improved styling for your submission.
