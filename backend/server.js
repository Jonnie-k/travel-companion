import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ─── ENV TOKENS ─────────────────────────────────────────────
const DUFFEL_TOKEN = process.env.DUFFEL_TOKEN;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Backend running smoothly!",
  });
});

// ─────────────────────────────────────────────────────────────
// HOTELS ROUTE
// ─────────────────────────────────────────────────────────────
app.get("/hotels", async (req, res) => {
  const { city, checkIn, checkOut, adults = 1 } = req.query;

  if (!city || !checkIn || !checkOut) {
    return res.status(400).json({
      error: "city, checkIn and checkOut are required",
    });
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

    const results = destinations.slice(0, 5).map((d) => ({
      id: d.dest_id,
      name: d.name || d.city_name,
      type: d.dest_type,
      country: d.country,
      region: d.region,
      label: d.label,
      bookingUrl: `https://www.booking.com/searchresults.html?dest_id=${d.dest_id}&dest_type=${d.dest_type}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=1`,
    }));

    res.json(results);
  } catch (error) {
    console.log("HOTELS ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// ─────────────────────────────────────────────────────────────
// FLIGHTS ROUTE (DUFFEL)
// ─────────────────────────────────────────────────────────────
app.post("/flights", async (req, res) => {
  const { origin, destination, date, passengers } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({
      error: "origin, destination, and date are required",
    });
  }

  const passengerCount = parseInt(passengers) || 1;
  const passengerList = Array.from({ length: passengerCount }, () => ({
    type: "adult",
  }));

  console.log("Searching flights:", { origin, destination, date, passengerCount });

  try {
    // Step 1: Create offer request
    const offerRequest = await axios.post(
      "https://api.duffel.com/air/offer_requests",
      {
        data: {
          slices: [
            {
              origin,
              destination,
              departure_date: date,
            },
          ],
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

    // Step 2: Get offers
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

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});