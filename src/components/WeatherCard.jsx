import PropTypes from 'prop-types';
import Card from './Card';

const WeatherCard = ({ data }) => {
  return (
    <Card title="Current Weather" className="weather-card">
      <div className="weather-info">
        <p><strong>Temperature:</strong> {data.temperature}</p>
        <p><strong>Humidity:</strong> {data.humidity}</p>
        <p><strong>Rain Chance:</strong> {data.rainChance}</p>
        <p><strong>Condition:</strong> {data.condition}</p>
      </div>
    </Card>
  );
};

WeatherCard.propTypes = {
  data: PropTypes.shape({
    temperature: PropTypes.string.isRequired,
    humidity: PropTypes.string.isRequired,
    rainChance: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
  }).isRequired,
};

export default WeatherCard;
