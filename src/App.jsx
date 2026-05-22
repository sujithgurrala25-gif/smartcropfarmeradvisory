import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const AppLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  return (
    <div className="app">
      {!isLoginPage && <Navbar />}
      <div className="app-body">
        {!isLoginPage && <Sidebar />}
        <main className={`main-content ${isLoginPage ? 'full-width' : ''}`}>
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
