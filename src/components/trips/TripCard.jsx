function TripCard({ trip }) {
  return (
    <div className="card">
      <h3>{trip.destination}</h3>

      <p>
        Start Date: {trip.startDate}
      </p>
    </div>
  );
}

export default TripCard;