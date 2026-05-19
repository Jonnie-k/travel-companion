
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

app.get("/hotels", async (req, res) => {
  const { city, checkIn, checkOut, adults = 1 } = req.query;

  if (!city || !checkIn || !checkOut) {
    return res.status(400).json({ error: "city, checkIn and checkOut are required" });
  }

  console.log("Searching hotels:", { city, checkIn, checkOut, adults });

  try {
    // Step 1: Get destination ID
    const destRes = await axios.get(
      "https://hotels-com-provider.p.rapidapi.com/v2/regions",
      {
        params: { query: city, locale: "en_US", domain: "US" },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "hotels-com-provider.p.rapidapi.com",
        },
      }
    );

    const region = destRes.data?.data?.find(
      (r) => r.type === "CITY" || r.type === "NEIGHBORHOOD"
    ) || destRes.data?.data?.[0];

    if (!region) {
      return res.status(404).json({ error: "Destination not found" });
    }

    // Step 2: Search hotels
    const hotelsRes = await axios.get(
      "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search",
      {
        params: {
          region_id: region.gaiaId,
          locale: "en_US",
          checkin_date: checkIn,
          checkout_date: checkOut,
          adults_number: adults,
          domain: "US",
          sort_order: "REVIEW",
          star_rating_ids: "3,4,5",
          page_number: "1",
        },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "hotels-com-provider.p.rapidapi.com",
        },
      }
    );

    const hotels = hotelsRes.data?.properties;

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ error: "No hotels found" });
    }

    const results = hotels.slice(0, 5).map((h) => ({
      id: h.id,
      name: h.name,
      type: "hotel",
      region: city,
      reviewScore: h.reviews?.score,
      reviewCount: h.reviews?.total,
      reviewScoreWord: h.reviews?.localizedAdvisory,
      price: h.price?.lead?.amount,
      currency: h.price?.lead?.currencyInfo?.code,
      photo: h.propertyImage?.image?.url,
      checkin: checkIn,
      checkout: checkOut,
      propertyClass: h.star,
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
