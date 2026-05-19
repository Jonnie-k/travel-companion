import axios from "axios";

export async function searchHotels({ city, checkIn, checkOut, adults }) {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/hotels`,
    {
      params: { city, checkIn, checkOut, adults },
      timeout: 60000,
    }
  );
  return response.data;
}