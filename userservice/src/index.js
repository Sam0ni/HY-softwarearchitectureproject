const express = require("express");
const app = express();

let users = [
  { id: "1", username: "testman" },
  { id: "2", username: "mrtest" },
];

app.get("/api/users", (request, response) => {
  response.json(users);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`user service running on port ${PORT}`);
});
