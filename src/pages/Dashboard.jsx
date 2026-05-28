import { Link } from 'react-router-dom';
import Card from '../components/Card';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h2 className="animate-slide-up">Welcome to Smart Farmer Advisory</h2>
      <p className="animate-slide-up delay-100" style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        Select a service below to get started.
      </p>
      
      <div className="dashboard-grid">
        <Card title="🌤️ Weather" className="dashboard-card animate-slide-up delay-150">
          <p>Get the latest weather updates for your farm.</p>
          <Link to="/weather" className="btn btn-secondary w-100">View Weather</Link>
        </Card>
        
        <Card title="🌱 Crops" className="dashboard-card animate-slide-up delay-200">
          <p>Find the best crops to plant based on soil and season.</p>
          <Link to="/crops" className="btn btn-secondary w-100">View Crops</Link>
        </Card>
        
        <Card title="🐛 Pests" className="dashboard-card animate-slide-up delay-250">
          <p>Stay alert on recent pest outbreaks and advice.</p>
          <Link to="/pests" className="btn btn-secondary w-100">View Alerts</Link>
        </Card>
        
        <Card title="📈 Market Prices" className="dashboard-card animate-slide-up delay-300">
          <p>Check the latest market prices for your harvest.</p>
          <Link to="/market" className="btn btn-secondary w-100">View Prices</Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
