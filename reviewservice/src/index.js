const express = require("express");
const app = express();

const cors = require("cors");

app.use(cors());

let reviews = [
  { id: "1", user: "1", album: "1", review: "Very good album!" },
  { id: "2", user: "1", album: "2", review: "So good!" },
  { id: "3", user: "2", album: "1", review: "THIS IS SO GOOD!" },
];

app.get("/api/reviews", (request, response) => {
  response.json(reviews);
});

app.get("/api/byalbum/:id", (request, response) => {
  const id = request.params.id;
  const results = reviews.filter((e) => e.album == id);
  response.json(results);
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Review service running on port ${PORT}`);
});
