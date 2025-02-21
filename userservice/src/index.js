const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3");
const database = new sqlite3.Database("./user.db");

app.use(cors());
app.use(express.json());

const runAsync = (stmt, ...params) => {
  return new Promise((resolve, reject) => {
    stmt.run(...params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

const getAsync = (stmt, ...params) => {
  return new Promise((resolve, reject) => {
    stmt.get(...params, function (err, row) {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allAsync = (stmt, ...params) => {
  return new Promise((resolve, reject) => {
    stmt.all(...params, function (err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

let users = [
  { id: "1", username: "testman" },
  { id: "2", username: "mrtest" },
];

database.exec(`
  CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  hashed TEXT
  );
  `);

app.get("/api/users", (request, response) => {
  const query = database.prepare("SELECT id, username FROM users");
  query.all((err, rows) => {
    response.json(rows);
  });
});

app.get("/api/user/:id", async (request, response) => {
  const id = request.params.id;
  const query = database.prepare("SELECT id, username FROM users WHERE id = ?");
  const result = await getAsync(query, id);
  response.json(result);
});

app.post("/api/register", async (request, response) => {
  const { username, password } = request.body;
  const saltRounds = 10;
  const hashed = await bcrypt.hash(password, saltRounds);
  const statement = database.prepare(
    "INSERT INTO users (username, hashed) VALUES (?,?)"
  );
  const userId = await runAsync(statement, username, hashed);
  statement.finalize();
  const query = database.prepare("SELECT id, username FROM users WHERE id = ?");
  const result = await getAsync(query, userId);
  response.status(201).json(result);
});

app.post("/api/login", async (request, response) => {
  const { username, password } = request.body;
  const query = database.prepare(
    "SELECT id, username, hashed FROM users WHERE username = ?"
  );
  const result = await getAsync(query, username);

  const passwordCorrect =
    result === null ? False : await bcrypt.compare(password, result.hashed);

  if (!(result && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: result.username,
    id: result.id,
  };

  const token = jwt.sign(userForToken, "temporarySecret");

  response.status(200).send({ token, username: result.username });
});

app.post("/api/validate", async (request, response) => {
  const { token } = request.body;
  const decodedToken = jwt.verify(token, "temporarySecret");
  console.log(decodedToken);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "invalid token" });
  }
  response.json(decodedToken);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`user service running on port ${PORT}`);
});
