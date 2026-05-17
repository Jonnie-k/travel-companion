import axios from "axios";

export async function searchHotels({ city, checkIn, checkOut, adults = 1 }) {
  const response = await axios.get("http://localhost:3001/hotels", {
    params: { city, checkIn, checkOut, adults },
  });
  return response.data;
}