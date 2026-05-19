import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://jonnie-k.github.io",
    ],
  })
);

app.use(express.json());

const DUFFEL_TOKEN = process.env.DUFFEL_TOKEN;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Root Route
app.get("/", (req, res) => {
  res.send("Travel Companion API is running");
});

// HOTELS ROUTE
app.get("/hotels", async (req, res) => {
  const { city, checkIn, checkOut, adults = 1 } = req.query;

  if (!city || !checkIn || !checkOut) {
    return res.status(400).json({
      error: "city, checkIn and checkOut are required",
    });
  }

  console.log("Searching hotels:", { city, checkIn, checkOut, adults });

  try {
    // Get destination/region ID
    const destinationResponse = await axios.get(
      "https://hotels-com-provider.p.rapidapi.com/v2/regions",
      {
        params: {
          query: city,
          locale: "en_US",
          domain: "US",
        },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "hotels-com-provider.p.rapidapi.com",
        },
        timeout: 30000,
      }
    );

    console.log("Destination API Response:", destinationResponse.data);

    const regions = destinationResponse.data?.data || [];
    const region =
      regions.find((r) => r.type === "CITY" || r.type === "NEIGHBORHOOD") ||
      regions[0];

    if (!region) {
      return res.status(404).json({ error: "Destination not found" });
    }

    console.log("Selected region:", region);

    // Hotel search
    const hotelsResponse = await axios.get(
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
          page_number: 1,
          star_rating_ids: "3,4,5",
        },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "hotels-com-provider.p.rapidapi.com",
        },
        timeout: 30000,
      }
    );

    console.log("Hotels API Response:", hotelsResponse.data);

    const hotels = hotelsResponse.data?.properties || [];

    if (hotels.length === 0) {
      return res.status(404).json({ error: "No hotels found" });
    }

    const results = hotels.slice(0, 5).map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      type: "hotel",
      region: city,
      reviewScore: hotel.reviews?.score || null,
      reviewCount: hotel.reviews?.total || 0,
      reviewScoreWord: hotel.reviews?.localizedAdvisory || null,
      price: hotel.price?.lead?.amount || null,
      currency: hotel.price?.lead?.currencyInfo?.code || "USD",
      photo: hotel.propertyImage?.image?.url || null,
      propertyClass: hotel.star || null,
      checkin: checkIn,
      checkout: checkOut,
    }));

    return res.json(results);
  } catch (error) {
    console.log("HOTELS ERROR:");
    console.log(error.response?.data);
    console.log(error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Hotels request timed out" });
    }

    return res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// FLIGHTS ROUTE
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
    // Create offer request
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
        timeout: 30000,
      }
    );

    const offerRequestId = offerRequest.data.data.id;
    console.log("Offer Request ID:", offerRequestId);

    // Get flights
    const offersResponse = await axios.get(
      `https://api.duffel.com/air/offers?offer_request_id=${offerRequestId}`,
      {
        headers: {
          Authorization: `Bearer ${DUFFEL_TOKEN}`,
          "Duffel-Version": "v2",
        },
        timeout: 30000,
      }
    );

    console.log("Flights found:", offersResponse.data.data.length);
    return res.json(offersResponse.data.data);
  } catch (error) {
    console.log("FLIGHTS ERROR:");
    console.log(error.response?.data);
    console.log(error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Flights request timed out" });
    }

    return res.status(500).json({ error: "Flight search failed" });
  }
});

// SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});