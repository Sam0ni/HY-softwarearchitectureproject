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
  {
    id: "3",
    name: "Rise And Fall Of Ziggy Stardust And The Spiders From Mars",
    artist: "2",
    songs: [
      "Five Years",
      "Ziggy Stardust",
      "Starman",
      "Suffragette City",
      "Lady Stardust",
    ],
    runtime: "42:21",
  },
  {
    id: "4",
    name: "Station To Station",
    artist: "2",
    songs: [
      "Station To Station",
      "TVC15",
      "Stay",
      "Wild Is The Wind",
      "Golden Years",
      "Word On The Wing",
    ],
    runtime: "39:39",
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

app.get("/api/artists/:id", (request, response) => {
  const id = request.params.id;
  const artist = artists.find((e) => e.id == id);
  const artistAlbums = albums.filter((e) => e.artist == artist.id);
  const res = { artist, albums: artistAlbums };
  response.json(res);
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Music service running on port ${PORT}`);
});
