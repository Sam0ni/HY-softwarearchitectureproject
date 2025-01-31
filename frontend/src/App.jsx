import axios from "axios";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";

const AlbumSearch = () => {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3002/api/albums").then((response) => {
      setAlbums(response.data);
    });
  }, []);

  return (
    <ol>
      {albums.map((album) => {
        return (
          <li key={album.id}>
            {<Link to={`/albums/${album.id}`}>{album.name}</Link>}
          </li>
        );
      })}
    </ol>
  );
};

const SingleAlbum = () => {
  const [albumInfo, setAlbumInfo] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);
  const albumId = useParams().id;

  useEffect(() => {
    axios
      .get(`http://localhost:3002/api/albums/${albumId}`)
      .then((response) => {
        setAlbumInfo(response.data);
      })
      .catch((e) => {
        console.log(e);
        setError("An error occurred while fetching data");
      });
    axios
      .get(`http://localhost:3003/api/byalbum/${albumId}`)
      .then((response) => {
        setReviews(response.data);
      })
      .catch((e) => {
        console.log(e);
        setError("An error occurred while fetching data");
      });
  }, [albumId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!albumInfo | !reviews) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>
        {albumInfo.name} - {albumInfo.artist.name}
      </h1>
      <p>Runtime: {albumInfo.runtime}</p>
      <p>Track List:</p>
      <ol>
        {albumInfo.songs.map((song) => {
          return <li key={song}>{song}</li>;
        })}
      </ol>
      <p>Reviews:</p>
      <ul>
        {reviews.map((review) => {
          return <li key={review.id}>{review.review}</li>;
        })}
      </ul>
    </div>
  );
};

const App = () => {
  const padding = {
    padding: 5,
  };
  return (
    <Router>
      <div>
        <Link style={padding} to="/">
          Home
        </Link>
        <Link style={padding} to="/albums">
          Albums
        </Link>
        <Link style={padding} to="/artists">
          Artists
        </Link>
      </div>

      <Routes>
        <Route path="/" />
        <Route path="/albums" element={<AlbumSearch />} />
        <Route path="/albums/:id" element={<SingleAlbum />} />
      </Routes>
    </Router>
  );
};

export default App;
