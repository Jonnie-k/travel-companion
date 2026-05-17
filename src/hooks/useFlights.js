import { useState } from "react";
import { searchFlights } from "../services/duffleApi";

export function useFlights() {
  const [flights, setFlights] = useState([]);

  async function fetchFlights(from, to) {
    const res = await searchFlights({ from, to });
    setFlights(res.slice(0, 6));
  }

  return { flights, fetchFlights };
}