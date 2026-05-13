import { Link } from 'react-router-dom';
import Card from '../components/Card';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h2>Welcome to Smart Farmer Advisory</h2>
      <p>Select a service below to get started.</p>
      
      <div className="dashboard-grid">
        <Card title="🌤️ Weather" className="dashboard-card">
          <p>Get the latest weather updates for your farm.</p>
          <Link to="/weather" className="btn btn-secondary">View Weather</Link>
        </Card>
        
        <Card title="🌱 Crops" className="dashboard-card">
          <p>Find the best crops to plant based on soil and season.</p>
          <Link to="/crops" className="btn btn-secondary">View Crops</Link>
        </Card>
        
        <Card title="🐛 Pests" className="dashboard-card">
          <p>Stay alert on recent pest outbreaks and advice.</p>
          <Link to="/pests" className="btn btn-secondary">View Alerts</Link>
        </Card>
        
        <Card title="📈 Market Prices" className="dashboard-card">
          <p>Check the latest market prices for your harvest.</p>
          <Link to="/market" className="btn btn-secondary">View Prices</Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
