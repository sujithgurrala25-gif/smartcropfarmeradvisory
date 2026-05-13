import PropTypes from 'prop-types';
import Card from './Card';

const PestCard = ({ pest }) => {
  return (
    <Card title={pest.name} className={`pest-card severity-${pest.severity.toLowerCase()}`}>
      <div className="pest-info">
        <p><strong>Crop:</strong> {pest.crop}</p>
        <p><strong>Severity:</strong> <span className={`badge ${pest.severity.toLowerCase()}`}>{pest.severity}</span></p>
        <p><strong>Advice:</strong> {pest.advice}</p>
      </div>
    </Card>
  );
};

PestCard.propTypes = {
  pest: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    crop: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    advice: PropTypes.string.isRequired,
  }).isRequired,
};

export default PestCard;
