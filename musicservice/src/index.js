const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

let albums = [
  {
    id: "1",
    name: "Defenders Of The Faith",
    artist: "1",
    songs: ["The Sentinel", "Freewheel Burning", "Some Heads Are Gonna Roll"],
    runtime: "41:35",
  },
  {
    id: "2",
    name: "Let's Dance",
    artist: "2",
    songs: ["Modern Love", "China Girl", "Let's Dance"],
    runtime: "38:29",
  },
];

let artists = [
  { id: "1", name: "Judas Priest" },
  { id: "2", name: "David Bowie" },
];

app.get("/api/artists", (request, response) => {
  response.json(artists);
});

app.get("/api/albums", (request, response) => {
  response.json(albums);
});

app.get("/api/albums/:id", (request, response) => {
  const id = request.params.id;
  const album = albums.find((e) => e.id == id);
  copy = structuredClone(album);
  copy.artist = artists.find((e) => e.id == album.artist);
  response.json(copy);
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Music service running on port ${PORT}`);
});
