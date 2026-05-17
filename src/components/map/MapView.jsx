function MapView({ city }) {
  return (
    <div className="card map-card">
      <h2>View location here!</h2>

      <iframe
        title="map"
        width="100%"
        height="300"
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps?q=${city}&output=embed`}
      />
    </div>
  );
}

export default MapView;