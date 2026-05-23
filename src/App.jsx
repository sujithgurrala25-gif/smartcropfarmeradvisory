import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  
  const validPaths = ['/', '/login', '/dashboard', '/weather', '/crops', '/pests', '/market', '/feedback'];
  const isNotFoundPage = !validPaths.includes(location.pathname);
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  
  const hideNavigation = isLoginPage || isNotFoundPage;

  return (
    <div className="app">
      {!hideNavigation && isAuthenticated && <Navbar />}
      <div className="app-body">
        {!hideNavigation && isAuthenticated && <Sidebar />}
        <main className={`main-content ${hideNavigation || !isAuthenticated ? 'full-width' : ''}`}>
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppLayout />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
