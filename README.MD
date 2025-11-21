# Bertie’s Books – Lab 7

Simple Node.js + MySQL web app for the Goldsmiths web dev labs. Built on top of the Lab 6 bookshop and extended with user registration and database-backed pages.

## Features

- Home, About, Search pages (`/`, `/about`, `/search`)
- Book list from MySQL (`/books`)
- Individual book detail (`/books/:id`)
- Registration form (`/register` → `/registered`)
- Users stored in `berties_books.users` (with hashed default password)

## Tech Stack

- Node.js, Express, EJS
- MySQL (database: `berties_books`)
- Deployed on Goldsmiths VM (`doc428`)

## Run Locally

```bash
npm install
npm start
# app on http://localhost:8000
