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
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

function Dashboard() {
  const [params] = useSearchParams();
  const city = (params.get("city") || "").trim();
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  const [cityInput, setCityInput] = useState("");

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const [flightResults, setFlightResults] = useState([]);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState("");

  const [hotelResults, setHotelResults] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState("");

  // Load persisted search results from Firestore 
  useEffect(() => {
    if (loading || !currentUser) return;

    async function loadPersistedData() {
      try {
        const docRef = doc(db, "searchResults", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.flightResults) setFlightResults(data.flightResults);
          if (data.hotelResults) setHotelResults(data.hotelResults);
        }
      } catch (error) {
        console.warn("Firestore unavailable. Starting with empty state.", error);
        setFlightResults([]);
        setHotelResults([]);
      }
    }

    loadPersistedData();
  }, [currentUser, loading]);

  // Saving results to Firestore
  async function saveResults(flights, hotels) {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "searchResults", currentUser.uid), {
        flightResults: flights,
        hotelResults: hotels,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving results to Firestore:", error);
    }
  }

  // City search
  function handleCitySearch(e) {
    e.preventDefault();
    const trimmed = cityInput.trim();
    if (!trimmed) return;
    navigate(`/dashboard?city=${encodeURIComponent(trimmed)}`);
  }

  // Loading weather when city changes
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

  // Flight search
  async function handleFlightSearch({ origin, destination, date, passengers }) {
    setFlightLoading(true);
    setFlightError("");
    setFlightResults([]);
    try {
      const results = await searchFlights({ origin, destination, date, passengers });
      const validResults = results.filter(
        (f) => f && f.slices && f.slices.length > 0
      );
      if (validResults.length === 0) {
        setFlightError("No flights found for this route.");
      } else {
        setFlightResults(validResults);
        await saveResults(validResults, hotelResults);
      }
    } catch (err) {
      setFlightError(err.message || "Flight search failed. Please try again.");
    } finally {
      setFlightLoading(false);
    }
  }

  // Hotel search
  async function handleHotelSearch({ checkIn, checkOut, adults }) {
    setHotelLoading(true);
    setHotelError("");
    setHotelResults([]);
    try {
      const results = await searchHotels({ city, checkIn, checkOut, adults });
      if (!results || results.length === 0) {
        setHotelError("No hotels found for this destination.");
      } else {
        setHotelResults(results);
        await saveResults(flightResults, results);
      }
    } catch (err) {
      setHotelError(err.message || "Hotel search failed. Please try again.");
    } finally {
      setHotelLoading(false);
    }
  }

  // Show nothing while auth is loading
  if (loading) return <Loading message="Loading..." />;

  return (
    <div className="dashboard-container">
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

      {!city ? (
        <div className="no-city">
          <p>Enter a city above to view travel insights.</p>
        </div>
      ) : (
        <div className="dashboard-grid">

          <section className="card-section">
            <h3>Weather</h3>
            {weatherLoading && <Loading message="Loading weather..." />}
            {weatherError && <ErrorMessage message={weatherError} />}
            {!weatherLoading && !weatherError && weatherData && (
              <WeatherCard weather={weatherData} />
            )}
          </section>

          <section className="card-section">
            <h3>Country Info</h3>
            <CountryInfo city={city} countryCode={weatherData?.country} />
          </section>

          <section className="card-section wide">
            <h3>Map</h3>
            <MapView city={city} />
          </section>

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

          <section className="card-section wide">
            <h3>Trip Planner</h3>
            <ItineraryPlanner />
          </section>

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