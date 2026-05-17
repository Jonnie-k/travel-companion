import axios from "axios";

export async function searchFlights({ origin, destination, date, passengers }) {
  console.log("CALLING BACKEND:", { origin, destination, date, passengers });

  const response = await axios.post("http://localhost:3001/flights", {
    origin,
    destination,
    date,
    passengers,
  });

  console.log("BACKEND RESPONSE:", response.data);
  return response.data;
}