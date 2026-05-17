import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://jonnie-k.github.io"],
}));
app.use(express.json());

const DUFFEL_TOKEN = process.env.DUFFEL_TOKEN;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

app.get("/", (req, res) => {
  res.json({ message: "Backend running smoothly!" });
});

app.get("/hotels", async (req, res) => {
  const { city, checkIn, checkOut, adults = 1 } = req.query;

  if (!city || !checkIn || !checkOut) {
    return res.status(400).json({ error: "city, checkIn and checkOut are required" });
  }

  console.log("Searching hotels:", { city, checkIn, checkOut, adults });

  try {
    const destRes = await axios.get(
      "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination",
      {
        params: { query: city },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
        },
      }
    );

    const destinations = destRes.data?.data;

    if (!destinations || destinations.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    const dest = destinations[0];

    const hotelsRes = await axios.get(
      "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels",
      {
        params: {
          dest_id: dest.dest_id,
          search_type: dest.search_type,
          arrival_date: checkIn,
          departure_date: checkOut,
          adults: adults,
          room_qty: 1,
          page_number: 1,
          units: "metric",
          temperature_unit: "c",
          languagecode: "en-us",
          currency_code: "USD",
        },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
        },
      }
    );

    const hotels = hotelsRes.data?.data?.hotels;

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ error: "No hotels found" });
    }

    const results = hotels
  .filter((h) => h.property?.name)
  .slice(0, 5)
  .map((h) => ({
    id: h.hotel_id,
    name: h.property?.name,
    type: "hotel",
    country: h.property?.countryCode,
    region: city,
    label: h.property?.name,
    bookingUrl: `https://www.booking.com/hotel/${h.property?.countryCode}/${h.hotel_id}.html`,
  }));

    res.json(results);
  } catch (error) {
    console.log("HOTELS ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

app.post("/flights", async (req, res) => {
  const { origin, destination, date, passengers } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "origin, destination, and date are required" });
  }

  const passengerCount = parseInt(passengers) || 1;
  const passengerList = Array.from({ length: passengerCount }, () => ({ type: "adult" }));

  console.log("Searching flights:", { origin, destination, date, passengerCount });

  try {
    const offerRequest = await axios.post(
      "https://api.duffel.com/air/offer_requests",
      {
        data: {
          slices: [{ origin, destination, departure_date: date }],
          passengers: passengerList,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DUFFEL_TOKEN}`,
          "Duffel-Version": "v2",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const offerId = offerRequest.data.data.id;

    const offers = await axios.get(
      `https://api.duffel.com/air/offers?offer_request_id=${offerId}`,
      {
        headers: {
          Authorization: `Bearer ${DUFFEL_TOKEN}`,
          "Duffel-Version": "v2",
        },
      }
    );

    res.json(offers.data.data);
  } catch (error) {
    console.log("FLIGHTS ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Flight search failed" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
