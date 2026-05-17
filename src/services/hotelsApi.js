import axios from "axios";

export async function searchHotels({ city, checkIn, checkOut, adults = 1 }) {
 const response = await axios.get(`${import.meta.env.VITE_API_URL}/hotels`, {
    params: { city, checkIn, checkOut, adults },
  });
  return response.data;
}
