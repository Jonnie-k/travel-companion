function FlightCard({ flight }) {
  // Guard against undefined/malformed flight
  if (!flight || !flight.slices?.length) {
    return null; // render nothing for bad data
  }

  const slice = flight.slices[0];
  const segment = slice?.segments?.[0];
  const lastSegment = slice?.segments?.at(-1);
  const stops = (slice?.segments?.length || 1) - 1;

  return (
    <div className="flight-card">
      <div className="flight-card-header">
        {flight.owner?.logo_symbol_url && (
          <img
            src={flight.owner.logo_symbol_url}
            alt={flight.owner?.name}
            width={32}
          />
        )}
        <h3>{flight.owner?.name || "Unknown Airline"}</h3>
      </div>

      <p className="route">
        {slice?.origin?.iata_code ?? "?"} → {slice?.destination?.iata_code ?? "?"}
      </p>

      <p>
        Departure:{" "}
        {segment?.departing_at
          ? new Date(segment.departing_at).toLocaleString()
          : "N/A"}
      </p>

      <p>
        Arrival:{" "}
        {lastSegment?.arriving_at
          ? new Date(lastSegment.arriving_at).toLocaleString()
          : "N/A"}
      </p>

      <p>Stops: {stops === 0 ? "Direct" : `${stops} stop(s)`}</p>

      <p className="price">
        <strong>
          {flight.total_currency} {flight.total_amount}
        </strong>
      </p>
    </div>
  );
}

export default FlightCard;