import axios from "axios";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function getCityWeather(city) {
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: "metric",
      },
    }
  );

  return res.data;
}