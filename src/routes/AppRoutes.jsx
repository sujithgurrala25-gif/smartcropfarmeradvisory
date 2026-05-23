import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Weather from '../pages/Weather';
import CropRecommendation from '../pages/CropRecommendation';
import PestAlert from '../pages/PestAlert';
import MarketPrice from '../pages/MarketPrice';
import Feedback from '../pages/Feedback';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/crops" element={<CropRecommendation />} />
        <Route path="/pests" element={<PestAlert />} />
        <Route path="/market" element={<MarketPrice />} />
        <Route path="/feedback" element={<Feedback />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
