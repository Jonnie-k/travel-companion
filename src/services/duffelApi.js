const response = await axios.post(`${import.meta.env.VITE_API_URL}/flights`, {const response = await axios.post(`${import.meta.env.VITE_API_URL}/flights`, {import axios from "axios";

export async function searchFlights({ origin, destination, date, passengers }) {
  console.log("CALLING BACKEND:", { origin, destination, date, passengers });

  const response = await axios.post(`${import.meta.env.VITE_API_URL}/flights`, {
    origin,
    destination,
    date,
    passengers,
  });

  console.log("BACKEND RESPONSE:", response.data);
  return response.data;
}
