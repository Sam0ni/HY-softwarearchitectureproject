import axios from "axios";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";

const ArtistSearch = () => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3002/api/artists").then((response) => {
      setArtists(response.data);
    });
  }, []);

  return (
    <ol>
      {artists.map((artist) => {
        return (
          <li key={artist.id}>
            {<Link to={`/artists/${artist.id}`}>{artist.name}</Link>}
          </li>
        );
      })}
    </ol>
  );
};

const SingleArtist = () => {
  const [artistInfo, setArtistInfo] = useState(null);
  const [albums, setAlbums] = useState(null);
  const [error, setError] = useState(null);
  const artistId = useParams().id;

  useEffect(() => {
    axios
      .get(`http://localhost:3002/api/artists/${artistId}`)
      .then((response) => {
        setArtistInfo(response.data.artist);
        setAlbums(response.data.albums);
      })
      .catch((e) => {
        console.log(e);
        setError("An error occurred while fetching data");
      });
  }, [artistId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!artistInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{artistInfo.name}</h1>
      <div>Number of albums: {albums.length}</div>
      <div>
        <ol>
          {albums.map((album) => {
            return (
              <li key={album.id}>
                <Link to={`/albums/${album.id}`}>{album.name}</Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

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
        if (response.data.length < 1) {
          setReviews(null);
        } else {
          setReviews(response.data);
        }
      })
      .catch((e) => {
        console.log(e);
        setError("An error occurred while fetching data");
      });
  }, [albumId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!albumInfo) {
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
          return (
            <li key={song.id}>
              {song.name} - {song.runtime}
            </li>
          );
        })}
      </ol>
      <p>Reviews:</p>
      {reviews ? (
        <ul>
          {reviews.map((review) => {
            return (
              <li key={review.id}>
                {review.review} -{review.user}
              </li>
            );
          })}
        </ul>
      ) : (
        <div>No reviews it seems :(</div>
      )}
    </div>
  );
};

const HiddenTab = forwardRef(({ buttonText, buttonStyle, children }, ref) => {
  const [hidden, setHidden] = useState(false);
  HiddenTab.displayName = "HiddenTab";

  const toggle = () => {
    setHidden(!hidden);
  };

  useImperativeHandle(ref, () => {
    return {
      toggle,
    };
  });

  return (
    <div style={buttonStyle}>
      {hidden && children}
      <button onClick={() => setHidden(!hidden)}>{buttonText}</button>
    </div>
  );
});

const CredentialsForm = ({
  buttonText,
  onSumbit,
  username,
  password,
  setUsername,
  setPassword,
}) => {
  return (
    <form onSubmit={onSumbit}>
      <input
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit">{buttonText}</button>
    </form>
  );
};

const App = () => {
  const padding = {
    padding: 5,
  };
  const loginFormRef = useRef();
  const registerFormRef = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storageUser = window.localStorage.getItem("loggedUser");
    if (storageUser) {
      const user = JSON.parse(storageUser);
      setUser(user);
      setToken(user.token);
    }
  }, []);

  const clearForms = () => {
    setUsername("");
    setPassword("");
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      });
      window.localStorage.setItem("loggedUser", JSON.stringify(response.data));
      setUser(response.data);
      setToken(response.data.token);
      clearForms();
      loginFormRef.current.toggle();
    } catch (exception) {
      console.log(exception);
    }
  };

  const submitRegister = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:3001/api/register", { username, password })
      .then((response) => {
        console.log(response);
        clearForms();
        registerFormRef.current.toggle();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const logOut = () => {
    window.localStorage.removeItem("loggedUser");
    setUser(null);
    setToken(null);
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
        {!user && (
          <HiddenTab
            buttonText="Register"
            buttonStyle={padding}
            ref={registerFormRef}
          >
            <CredentialsForm
              buttonText="Register new user"
              onSumbit={submitRegister}
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
            />
          </HiddenTab>
        )}
        {!user && (
          <HiddenTab
            buttonText="Login"
            buttonStyle={padding}
            ref={loginFormRef}
          >
            <CredentialsForm
              buttonText="Log In"
              onSumbit={submitLogin}
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
            />
          </HiddenTab>
        )}
        {user && (
          <Link style={padding} onClick={logOut}>
            Log Out
          </Link>
        )}
      </div>

      <Routes>
        <Route path="/" />
        <Route path="/albums" element={<AlbumSearch />} />
        <Route path="/albums/:id" element={<SingleAlbum />} />
        <Route path="/artists" element={<ArtistSearch />} />
        <Route path="/artists/:id" element={<SingleArtist />} />
      </Routes>
    </Router>
  );
};

export default App;
