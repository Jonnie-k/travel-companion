const API_KEY = import.meta.env.VITE_DUFFEL_KEY;
const BASE_URL = "https://api.duffel.com";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Duffel-Version": "v1",
  Accept: "application/json",
};

// Step 1: Create an offer request (search for flights)
export async function searchFlights({ origin, destination, date, passengers = 1 }) {
  const res = await fetch(`${BASE_URL}/air/offer_requests`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        slices: [
          {
            origin,        // IATA code e.g. "NBO"
            destination,   // IATA code e.g. "LHR"
            departure_date: date, // "2025-06-01"
          },
        ],
        passengers: Array(passengers).fill({ type: "adult" }),
        cabin_class: "economy",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors?.[0]?.message || "Flight search failed");
  }

  const data = await res.json();
  const offerRequestId = data.data.id;

  // Step 2: Get offers from the request
  return getOffers(offerRequestId);
}

// Step 2: Fetch offers for a request
async function getOffers(offerRequestId) {
  const res = await fetch(
    `${BASE_URL}/air/offers?offer_request_id=${offerRequestId}&sort=total_amount`,
    { headers }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors?.[0]?.message || "Failed to get offers");
  }

  const data = await res.json();

  return data.data.map((offer) => ({
    id: offer.id,
    price: offer.total_amount,
    currency: offer.total_currency,
    airline: offer.owner.name,
    airlineLogo: offer.owner.logo_symbol_url,
    departure: offer.slices[0].segments[0].departing_at,
    arrival: offer.slices[0].segments.at(-1).arriving_at,
    origin: offer.slices[0].origin.iata_code,
    destination: offer.slices[0].destination.iata_code,
    duration: offer.slices[0].duration,
    stops: offer.slices[0].segments.length - 1,
  }));
}