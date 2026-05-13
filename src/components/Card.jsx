import PropTypes from 'prop-types';

const Card = ({ children, title, className }) => {
  return (
    <div className={`card ${className || ''}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
};

export default Card;
