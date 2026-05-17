function WeatherCard({ weather }) {
  if (!weather) return <p className="empty">No weather data yet.</p>;

  return (
    <div className="weather-card">
      <div className="weather-header">
        <img src={weather.icon} alt={weather.description} />
        <div>
          <h2>{weather.city}, {weather.country}</h2>
          <p className="desc">{weather.description}</p>
        </div>
      </div>
      <p className="temp">{weather.temp}°C</p>
      <div className="weather-details">
        <p>Feels like: {weather.feelsLike}°C</p>
        <p>Humidity: {weather.humidity}%</p>
        <p>Wind: {weather.wind} m/s</p>
      </div>
    </div>
  );
}

export default WeatherCard;