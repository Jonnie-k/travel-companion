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
    const locationRes = await axios.get(
      "https://apidojo-booking-v1.p.rapidapi.com/locations/auto-complete",
      {
        params: { text: city, languagecode: "en-us" },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com",
        },
      }
    );

    const locations = locationRes.data;
    if (!locations || locations.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    const destId = locations[0].dest_id;

    const hotelsRes = await axios.get(
      "https://apidojo-booking-v1.p.rapidapi.com/properties/v2/list",
      {
        params: {
          offset: 0,
          arrival_date: checkIn,
          departure_date: checkOut,
          guest_qty: adults,
          dest_ids: destId,
          room_qty: 1,
          search_type: "city",
          price_filter_currencycode: "USD",
          order_by: "popularity",
          languagecode: "en-us",
          units: "imperial",
        },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com",
        },
      }
    );

    const hotels = hotelsRes.data.result;

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ error: "No hotels found" });
    }

    const results = hotels.slice(0, 5).map((h) => ({
      id: h.hotel_id,
      name: h.hotel_name,
      type: "hotel",
      country: h.country_trans,
      region: h.city_trans,
      label: h.hotel_name,
      bookingUrl: h.url,
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
