const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3");
const database = new sqlite3.Database("./review.db");

app.use(cors());
app.use(express.json());

database.exec(`
  CREATE TABLE IF NOT EXISTS reviews(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user INTEGER,
  album INTEGER,
  review TEXT
  );
  `);

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

let reviews = [
  { id: "1", user: "1", album: "1", review: "Very good album!" },
  { id: "2", user: "1", album: "2", review: "So good!" },
  { id: "3", user: "2", album: "1", review: "THIS IS SO GOOD!" },
];

const getToken = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

app.get("/api/reviews", async (request, response) => {
  const query = database.prepare("SELECT * FROM reviews");
  const reviews = await allAsync(query);
  response.json(reviews);
});

app.get("/api/byalbum/:id", async (request, response) => {
  const id = request.params.id;
  const query = database.prepare("SELECT * FROM reviews WHERE album = ?");
  const allReviews = await allAsync(query, id);
  for (const revi of allReviews) {
    const username = await axios.get(
      `http://localhost:3001/api/user/${revi.user}`
    );
    console.log(username.data.username, revi.user);
    revi.user = username.data.username;
  }
  response.json(allReviews);
});

app.post("/api/reviews", async (request, response) => {
  const statement = database.prepare(
    "INSERT INTO reviews (user, album, review) VALUES (?,?,?)"
  );
  const query = database.prepare("SELECT * FROM reviews WHERE id = ?");
  const body = request.body;
  const token = getToken(request);
  if (!token) {
    response.status(401).json({ error: "Not logged in" });
  }
  try {
    const decoded = await axios.post("http://localhost:3001/api/validate", {
      token: token,
    });
    const newId = await runAsync(statement, [
      decoded.data.id,
      body.album,
      body.review,
    ]);
    statement.finalize();
    const result = await getAsync(query, newId);
    response.status(201).json(result);
  } catch (err) {
    console.log(err);
    response.status(401).json(err);
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Review service running on port ${PORT}`);
});
