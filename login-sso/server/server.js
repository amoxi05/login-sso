const express = require('express');
const fs = require('fs');
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000; // Use port 5000 or the one specified in the environment variable

const secretKey = process.env.SECRET_KEY;
const host = process.env.HOST;
const user = process.env.USER;
const passWord = process.env.PASSWORD;
const dataBase = process.env.DATABASE;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const con = mysql.createConnection({
  host: host,
  user: user,
  password: passWord,
  database: dataBase,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// Route for handling GET requests to the root URL
app.get('/', (req, res) => {
  fs.readFile('index.html', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

// Registration endpoint
app.post("/register", async (req, res) => {
  // Handle registration logic
});

// Login endpoint
app.post("/login", async (req, res) => {
  // Handle login logic
});

// Protected endpoint
app.get("/protected", (req, res) => {
  // Handle protected endpoint logic
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
