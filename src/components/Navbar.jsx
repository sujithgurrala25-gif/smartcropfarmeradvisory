import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🌾 Smart Farmer Advisory</h1>
      </div>
      <div className="navbar-actions">
        <ThemeToggle />
        {isAuthenticated && (
          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
