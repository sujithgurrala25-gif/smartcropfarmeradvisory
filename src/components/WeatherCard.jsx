import PropTypes from "prop-types";
import "./WeatherCard.css";

const WeatherCard = ({ data }) => {
  // Choose an icon based on the condition
  let weatherIcon = "☀️";
  const condition = (data.condition || "").toLowerCase();
  if (condition.includes("cloud")) weatherIcon = "⛅";
  if (condition.includes("rain")) weatherIcon = "🌧️";
  if (condition.includes("storm")) weatherIcon = "⛈️";
  if (condition.includes("snow")) weatherIcon = "❄️";

  return (
    <div className="premium-weather-card">
      <div className="weather-bg-shape"></div>
      <div className="weather-bg-shape-2"></div>

      <div className="weather-content">
        <div className="weather-header">
          <div className="weather-temp-container">
            <div className="weather-temp">{data.temperature}</div>
            <div className="weather-condition-text">{data.condition}</div>
          </div>
          <div className="weather-condition-icon">{weatherIcon}</div>
        </div>

        <div className="weather-details">
          <div className="weather-detail-item">
            <span className="weather-detail-icon">💧</span>
            <span className="weather-detail-value">{data.humidity}</span>
            <span className="weather-detail-label">Humidity</span>
          </div>
          <div className="weather-detail-item">
            <span className="weather-detail-icon">☔</span>
            <span className="weather-detail-value">{data.rainChance}</span>
            <span className="weather-detail-label">Rain Chance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
