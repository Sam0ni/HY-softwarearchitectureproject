const express = require("express");
const app = express();
const cors = require("cors");
const sqlite3 = require("sqlite3");
const database = new sqlite3.Database("./music.db");

database.exec("PRAGMA foreign_keys = ON;");

database.exec(`
  CREATE TABLE IF NOT EXISTS albums(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  artist INTEGER,
  runtime TEXT,
  FOREIGN KEY (artist) references artists(id) ON DELETE CASCADE
  );
  `);

database.exec(`
  CREATE TABLE IF NOT EXISTS songs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  album INTEGER,
  runtime TEXT,
  FOREIGN KEY (album) references albums(id) ON DELETE CASCADE
  );
  `);

database.exec(`
  CREATE TABLE IF NOT EXISTS artists(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT
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

const insertStuff = async () => {
  const insertAlbum = database.prepare(
    "INSERT INTO albums (name, artist, runtime) VALUES (?, ?, ?)"
  );
  const insertArtist = database.prepare(
    "INSERT INTO artists (name, description) VALUES (?, ?)"
  );
  const insertSong = database.prepare(
    "INSERT INTO songs (name, album, runtime) VALUES (?, ?, ?)"
  );
  let artistId = await runAsync(
    insertArtist,
    "David Bowie",
    "The Thin White Duke"
  );
  insertArtist.finalize();
  //const insertResult2 = insertArtist.run();

  let dotf = await runAsync(
    insertAlbum,
    "Station To Station",
    artistId,
    "39:39"
  );

  let dotf2 = await runAsync(
    insertAlbum,
    "Rise And Fall Of Ziggy Stardust And The Spiders From Mars",
    artistId,
    "42:21"
  );
  insertAlbum.finalize();
  await runAsync(insertSong, "Station To Station", dotf, "10:35");

  await runAsync(insertSong, "Golden Years", dotf, "4:31");

  await runAsync(insertSong, "Stay", dotf, "4:39");

  await runAsync(insertSong, "Word On The Wing", dotf, "4:12");

  await runAsync(insertSong, "Wild Is The Wind", dotf, "5:28");

  await runAsync(insertSong, "TVC15", dotf, "3:45");

  await runAsync(insertSong, "Five Years", dotf2, "5:52");

  await runAsync(insertSong, "Ziggy Stardust", dotf2, "3:22");

  await runAsync(insertSong, "Starman", dotf2, "4:11");

  await runAsync(insertSong, "Suffragette City", dotf2, "3:51");

  await runAsync(insertSong, "Lady Stardust", dotf2, "3:42");

  insertSong.finalize();

  const query1 = database.prepare("SELECT * FROM albums");
  const query2 = database.prepare("SELECT * FROM songs");
  const query3 = database.prepare("SELECT * FROM artists");

  query3.all((err, rows) => {
    console.log(rows);
  });
  query1.all((err, rows) => {
    console.log(rows);
  });
  query2.all((err, rows) => {
    console.log(rows);
  });

  query1.finalize();
  query2.finalize();
  query3.finalize();

  database.close();
};

//insertStuff();

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
  const query = database.prepare("SELECT * FROM artists");
  query.all((err, rows) => {
    console.log(rows);
    response.json(rows);
  });
});

app.get("/api/albums", (request, response) => {
  const query = database.prepare("SELECT * FROM albums");
  query.all((err, rows) => {
    response.json(rows);
  });
});

app.get("/api/albums/:id", async (request, response) => {
  const id = request.params.id;
  const query = database.prepare("SELECT * FROM albums WHERE id = ?");
  const query2 = database.prepare("SELECT * FROM songs WHERE album = ?");
  const query3 = database.prepare("SELECT * FROM artists WHERE id = ?");
  const album = await getAsync(query, id);
  console.log(album);
  const songs = await allAsync(query2, album.id);
  console.log(songs);
  const artist = await getAsync(query3, album.artist);

  console.log(artist);

  const wholeAlbum = { ...album, songs: songs, artist: artist };
  response.json(wholeAlbum);
});

app.get("/api/artists/:id", async (request, response) => {
  const query = database.prepare("SELECT * FROM artists WHERE id = ?");
  const query2 = database.prepare("SELECT * FROM albums WHERE artist = ?");
  const id = request.params.id;
  const artist = await getAsync(query, id);
  const artistAlbums = await allAsync(query2, id);
  const res = { artist, albums: artistAlbums };
  response.json(res);
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Music service running on port ${PORT}`);
});
