import { useState } from "react";

function FlightSearchForm({ onSearch }) {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    date: "",
    passengers: 1,
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.origin || !form.destination || !form.date) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.origin.length !== 3 || form.destination.length !== 3) {
      setError("Use 3-letter IATA codes e.g. NBO, DXB, LHR");
      return;
    }

    onSearch({
      origin: form.origin.toUpperCase(),
      destination: form.destination.toUpperCase(),
      date: form.date,
      passengers: Number(form.passengers),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        name="origin"
        type="text"
        placeholder="From (e.g. NBO)"
        value={form.origin}
        onChange={handleChange}
        maxLength={3}
      />
      <input
        name="destination"
        type="text"
        placeholder="To (e.g. DXB)"
        value={form.destination}
        onChange={handleChange}
        maxLength={3}
      />
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        min={new Date().toISOString().split("T")[0]} // disables past dates
      />
      <select
        name="passengers"
        value={form.passengers}
        onChange={handleChange}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? "Passenger" : "Passengers"}
          </option>
        ))}
      </select>

      <button type="submit">Search Flights</button>
    </form>
  );
}

export default FlightSearchForm;