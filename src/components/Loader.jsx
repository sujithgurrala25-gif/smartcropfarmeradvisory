import { ClipLoader } from 'react-spinners';
import PropTypes from 'prop-types';

const Loader = ({ loading, message }) => {
  if (!loading) return null;

  return (
    <div className="loader-container">
      <ClipLoader color="#4CAF50" loading={loading} size={50} />
      {message && <p>{message}</p>}
    </div>
  );
};

Loader.propTypes = {
  loading: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

Loader.defaultProps = {
  message: 'Loading...',
};

export default Loader;
