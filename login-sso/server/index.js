const mysql = require("mysql");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const host = process.env.HOST;
const user = process.env.USER;
const passWord = process.env.PASSWORD;
const dataBase = process.env.DATABASE;

app.listen(5001, () => console.log("Start service on port 5001"));
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

// Registration endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Check if username already exists
  con.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      } else {
        // Insert new user into the database
        con.query(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hashedPassword],
          (error, result) => {
            if (error) {
              return res.status(500).json({ error: error.message });
            }
            return res.status(201).json({ message: "Registration successful" });
          }
        );
      }
    }
  );
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Retrieve user data from the database
  con.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Username or password incorrect" });
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, results[0].password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Username or password incorrect" });
      } else {
        // Generate JWT token
        const token = jwt.sign({ username: username }, secretKey, {
          expiresIn: "1h",
        });
        return res.status(200).json({ token });
      }
    }
  );
});

// Protected endpoint
app.get("/protected", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);

    res.json({
      message: "Hello! You are authorized",
      decoded,
    });
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
});
