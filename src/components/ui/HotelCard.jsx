function HotelCard({ hotel }) {
  if (!hotel) return null;

  return (
    <div className="hotel-card">
      <div className="hotel-info">
        <h3>{hotel.name}</h3>
        {hotel.country && <p>{hotel.region ? `${hotel.region}, ` : ""}{hotel.country}</p>}
        {hotel.type && (
          <p style={{ textTransform: "capitalize", color: "#666" }}>
            {hotel.type}
          </p>
        )}
        <a
          href={hotel.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="booking-link"
        >
          View Hotels on Booking.com →
        </a>
      </div>
    </div>
  );
}

export default HotelCard;