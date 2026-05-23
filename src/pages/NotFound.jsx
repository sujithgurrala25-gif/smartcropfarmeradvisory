import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="not-found-wrapper">
      <div className="not-found-card">
        <div className="not-found-icon">🌾⚠️</div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-text">
          Oops! The field you are trying to cultivate does not exist. The page you requested could not be found.
        </p>
        <button onClick={handleGoBack} className="btn btn-primary not-found-btn">
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
