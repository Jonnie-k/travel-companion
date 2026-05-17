import { useState } from "react";

function HotelSearchForm({ onSearch }) {
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.checkIn || !form.checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    if (form.checkIn >= form.checkOut) {
      setError("Check-out must be after check-in.");
      return;
    }

    onSearch({
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: Number(form.adults),
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        name="checkIn"
        type="date"
        value={form.checkIn}
        onChange={handleChange}
        min={today}
      />
      <input
        name="checkOut"
        type="date"
        value={form.checkOut}
        onChange={handleChange}
        min={today}
      />
      <select name="adults" value={form.adults} onChange={handleChange}>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? "Adult" : "Adults"}
          </option>
        ))}
      </select>
      <button type="submit">Search Hotels</button>
    </form>
  );
}

export default HotelSearchForm;