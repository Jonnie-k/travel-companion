const BASE_URL = "https://restcountries.com/v3.1";

export async function getCountryByCity(city) {
  // First get country code from OpenWeatherMap response,
  // or search by city name via a geocoding step.
  // Easiest: search by country name directly.
  const res = await fetch(`${BASE_URL}/capital/${encodeURIComponent(city)}`);

  if (!res.ok) {
    // Fallback: try searching by city as a country name
    const fallback = await fetch(
      `${BASE_URL}/name/${encodeURIComponent(city)}`
    );
    if (!fallback.ok) throw new Error("Country not found");
    const data = await fallback.json();
    return formatCountry(data[0]);
  }

  const data = await res.json();
  return formatCountry(data[0]);
}

export async function getCountryByCode(code) {
  const res = await fetch(`${BASE_URL}/alpha/${code}`);
  if (!res.ok) throw new Error("Country not found");
  const data = await res.json();
  return formatCountry(data[0]);
}

function formatCountry(data) {
  return {
    name: data.name.common,
    capital: data.capital?.[0] || "N/A",
    population: data.population.toLocaleString(),
    region: data.region,
    subregion: data.subregion,
    currency: Object.values(data.currencies || {})[0]?.name || "N/A",
    currencySymbol: Object.values(data.currencies || {})[0]?.symbol || "",
    languages: Object.values(data.languages || {}).join(", "),
    flag: data.flags?.svg || data.flags?.png,
    timezone: data.timezones?.[0] || "N/A",
  };
}