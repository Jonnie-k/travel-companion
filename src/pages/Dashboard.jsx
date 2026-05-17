import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getCityWeather } from "../services/weatherApi";
import { searchFlights } from "../services/duffelApi";
import { searchHotels } from "../services/hotelsApi";
import WeatherCard from "../components/weather/WeatherCard";
import CountryInfo from "../components/country/CountryInfo";
import MapView from "../components/map/MapView";
import FlightCard from "../components/flights/FlightCard";
import FlightSearchForm from "../components/flights/FlightSearchForm";
import HotelCard from "../components/ui/HotelCard";
import HotelSearchForm from "../components/ui/HotelSearchForm";
import ItineraryPlanner from "../components/ui/ItineraryPlanner";
import Loading from "../components/ui/Loading";
import ErrorMessage from "../components/ui/ErrorMessage";
import ErrorBoundary from "../components/ui/ErrorBoundary";

function Dashboard() {
  const [params] = useSearchParams();
  const city = (params.get("city") || "").trim();
  const navigate = useNavigate();

  // City search state
  const [cityInput, setCityInput] = useState("");

  // Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // Flight state
  const [flightResults, setFlightResults] = useState([]);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState("");

  // Hotel state
  const [hotelResults, setHotelResults] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState("");

  // ─── City search ──────────────────────────────────────────────────────
  function handleCitySearch(e) {
    e.preventDefault();
    const trimmed = cityInput.trim();
    if (!trimmed) return;
    navigate(`/dashboard?city=${encodeURIComponent(trimmed)}`);
  }

  // ─── Weather: loads automatically when city changes ───────────────────
  useEffect(() => {
    if (!city) {
      setWeatherData(null);
      setWeatherError("");
      return;
    }

    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError("");
      setWeatherData(null);
      try {
        const weather = await getCityWeather(city);
        setWeatherData(weather);
      } catch (err) {
        setWeatherError(
          err.message === "city not found"
            ? `City "${city}" not found. Please check the spelling.`
            : "Failed to load weather data."
        );
      } finally {
        setWeatherLoading(false);
      }
    }

    loadWeather();
  }, [city]);

  // ─── Flights: triggered by FlightSearchForm ───────────────────────────
  async function handleFlightSearch({ origin, destination, date, passengers }) {
    setFlightLoading(true);
    setFlightError("");
    setFlightResults([]);
    try {
      const results = await searchFlights({
        origin,
        destination,
        date,
        passengers,
      });
      const validResults = results.filter(
        (f) => f && f.slices && f.slices.length > 0
      );
      if (validResults.length === 0) {
        setFlightError("No flights found for this route.");
      } else {
        setFlightResults(validResults);
      }
    } catch (err) {
      setFlightError(err.message || "Flight search failed. Please try again.");
    } finally {
      setFlightLoading(false);
    }
  }

  // ─── Hotels: triggered by HotelSearchForm ────────────────────────────
  async function handleHotelSearch({ checkIn, checkOut, adults }) {
    setHotelLoading(true);
    setHotelError("");
    setHotelResults([]);
    try {
      const results = await searchHotels({
        city,
        checkIn,
        checkOut,
        adults,
      });
      if (!results || results.length === 0) {
        setHotelError("No hotels found for this destination.");
      } else {
        setHotelResults(results);
      }
    } catch (err) {
      setHotelError(err.message || "Hotel search failed. Please try again.");
    } finally {
      setHotelLoading(false);
    }
  }

  return (
    <div className="dashboard-container">

      {/* ── HEADER with city search ──────────────────────────────────── */}
      <header className="dashboard-header">
        <h1>Travel Dashboard</h1>

        <form onSubmit={handleCitySearch} className="dashboard-search">
          <input
            type="text"
            placeholder="Search a city e.g. Nairobi, Paris..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {city && <h2 className="city-title">{city}</h2>}
      </header>

      {/* ── DASHBOARD GRID ───────────────────────────────────────────── */}
      {!city ? (
        // Show prompt when no city is selected yet
        <div className="no-city">
          <p>Enter a city above to view travel insights.</p>
        </div>
      ) : (
        <div className="dashboard-grid">

          {/* ── WEATHER ──────────────────────────────────────────────── */}
          <section className="card-section">
            <h3>Weather</h3>
            {weatherLoading && <Loading message="Loading weather..." />}
            {weatherError && <ErrorMessage message={weatherError} />}
            {!weatherLoading && !weatherError && weatherData && (
              <WeatherCard weather={weatherData} />
            )}
          </section>

          {/* ── COUNTRY INFO ─────────────────────────────────────────── */}
          <section className="card-section">
            <h3>Country Info</h3>
            <CountryInfo
              city={city}
              countryCode={weatherData?.country}
            />
          </section>

          {/* ── MAP ──────────────────────────────────────────────────── */}
          <section className="card-section wide">
            <h3>Map</h3>
            <MapView city={city} />
          </section>

          {/* ── HOTELS ───────────────────────────────────────────────── */}
          <section className="card-section wide">
            <h3>Hotels</h3>
            <HotelSearchForm onSearch={handleHotelSearch} />
            {hotelLoading && <Loading message="Searching hotels..." />}
            {hotelError && <ErrorMessage message={hotelError} />}
            {!hotelLoading && hotelResults.length > 0 && (
              <ErrorBoundary>
                <div className="hotel-grid">
                  {hotelResults.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              </ErrorBoundary>
            )}
            {!hotelLoading && !hotelError && hotelResults.length === 0 && (
              <p>Search for hotels above to see results.</p>
            )}
          </section>

          {/* ── ITINERARY ────────────────────────────────────────────── */}
          <section className="card-section">
            <h3>Trip Planner</h3>
            <ItineraryPlanner />
          </section>

          {/* ── FLIGHTS ──────────────────────────────────────────────── */}
          <section className="card-section wide">
            <h3>Flights</h3>
            <FlightSearchForm onSearch={handleFlightSearch} />
            {flightLoading && <Loading message="Searching flights..." />}
            {flightError && <ErrorMessage message={flightError} />}
            {!flightLoading && flightResults.length > 0 && (
              <ErrorBoundary>
                <div className="flight-grid">
                  {flightResults.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </ErrorBoundary>
            )}
            {!flightLoading && !flightError && flightResults.length === 0 && (
              <p>Search for flights above to see results.</p>
            )}
          </section>

        </div>
      )}
    </div>
  );
}

export default Dashboard;