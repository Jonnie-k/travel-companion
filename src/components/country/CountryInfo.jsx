import { useEffect, useState } from "react";

const BASE_URL = "https://restcountries.com/v3.1";

async function getCountryByCode(code) {
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
    subregion: data.subregion || "N/A",
    currency: Object.values(data.currencies || {})[0]?.name || "N/A",
    currencySymbol: Object.values(data.currencies || {})[0]?.symbol || "",
    languages: Object.values(data.languages || {}).join(", "),
    flag: data.flags?.svg || data.flags?.png,
    timezone: data.timezones?.[0] || "N/A",
  };
}

function CountryInfo({ countryCode }) {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ Only fetch when we have a valid 2-letter country code from weather
    if (!countryCode || countryCode.length > 3) return;

    async function loadCountry() {
      setLoading(true);
      setError("");
      setCountry(null);
      try {
        const data = await getCountryByCode(countryCode);
        setCountry(data);
      } catch (err) {
        setError("Country info not available.");
      } finally {
        setLoading(false);
      }
    }

    loadCountry();
  }, [countryCode]); // ✅ only depends on countryCode, not city

  // ✅ Wait silently until weather loads and provides countryCode
  if (!countryCode) return <p className="empty">Loading country data...</p>;
  if (loading) return <p>Loading country info...</p>;
  if (error) return <p className="empty">{error}</p>;
  if (!country) return null;

  return (
    <div className="country-card">
      <div className="country-header">
        {country.flag && (
          <img src={country.flag} alt={`${country.name} flag`} width={48} />
        )}
        <h2>{country.name}</h2>
      </div>
      <div className="country-details">
        <p><strong>Capital:</strong> {country.capital}</p>
        <p><strong>Region:</strong> {country.subregion}, {country.region}</p>
        <p><strong>Population:</strong> {country.population}</p>
        <p><strong>Currency:</strong> {country.currency} ({country.currencySymbol})</p>
        <p><strong>Languages:</strong> {country.languages}</p>
        <p><strong>Timezone:</strong> {country.timezone}</p>
      </div>
    </div>
  );
}

export default CountryInfo;