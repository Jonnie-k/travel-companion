import axios from "axios";

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

export async function getCityWeather(city) {
  if (!WEATHER_API_KEY) {
    throw new Error("Weather API key is missing.");
  }

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