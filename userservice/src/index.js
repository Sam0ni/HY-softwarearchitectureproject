const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`user service running on port ${PORT}`);
});
