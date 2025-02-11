const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

let users = [
  { id: "1", username: "testman" },
  { id: "2", username: "mrtest" },
];

app.get("/api/users", (request, response) => {
  response.json(users);
});

app.get("/api/user/:id", (request, response) => {
  const id = request.params.id;
  const result = users.find((e) => e.id == id);
  response.json(result);
});

app.post("/api/register", async (request, response) => {
  const { username, password } = request.body;
  const saltRounds = 10;
  const hashed = await bcrypt.hash(password, saltRounds);
  const newId = Math.max(...users.map((e) => e.id)) + 1;
  const newUser = { id: newId, username, passwordHashed: hashed };
  users = [...users, newUser];
  const { passwordHashed, ...returnedUser } = newUser;
  response.status(201).json(returnedUser);
});

app.post("/api/login", async (request, response) => {
  const { username, password } = request.body;

  const user = users.find((e) => e.username === username);
  const passwordCorrect =
    user === null ? False : await bcrypt.compare(password, user.passwordHashed);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, "temporarySecret");

  response.status(200).send({ token, username: user.username });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`user service running on port ${PORT}`);
});
