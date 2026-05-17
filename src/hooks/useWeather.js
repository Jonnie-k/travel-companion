import { useEffect, useState } from "react";
import { getCityWeather } from "../services/api";

export function useWeather(city) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!city) return;

    getCityWeather(city).then(setData);
  }, [city]);

  return data;
}