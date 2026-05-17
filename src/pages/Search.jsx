import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();

    const trimmed = city.trim();
    if (!trimmed) return;

    navigate(`/dashboard?city=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="search-page">
      <div className="overlay">
        <div className="content">
          <h1>Travel Companion</h1>
          <p>Search any destination worldwide</p>

          <form onSubmit={handleSearch} className="search-box">
            <input
              type="text"
              placeholder="Enter a city (e.g. Nairobi, Paris...)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <button type="submit">Search</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Search;