import { useState, useEffect } from 'react';
import { fetchCrops } from '../utils/api';
import Loader from '../components/Loader';
import Card from '../components/Card';

const CropRecommendation = () => {
  const [soilType, setSoilType] = useState('Black');
  const [season, setSeason] = useState('Monsoon');
  const [cropData, setCropData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const getCrops = async () => {
      setLoading(true);
      try {
        const data = await fetchCrops();
        if (isMounted) {
          setCropData(data);
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch crop data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    getCrops();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const result = cropData.find(c => c.soilType === soilType && c.season === season);
    setSuggestions(result ? result.recommendations : []);
  };

  return (
    <div className="page-container">
      <h2>Crop Recommendations</h2>
      
      <Loader loading={loading} message="Loading crop models..." />
      
      {!loading && !error && (
        <div className="crop-layout">
          <Card title="Enter Field Details" className="crop-form-card">
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label>Soil Type:</label>
                <select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                  <option value="Black">Black Soil</option>
                  <option value="Red">Red Soil</option>
                  <option value="Alluvial">Alluvial Soil</option>
                </select>
              </div>
              <div className="form-group">
                <label>Season:</label>
                <select value={season} onChange={(e) => setSeason(e.target.value)}>
                  <option value="Monsoon">Monsoon (Kharif)</option>
                  <option value="Winter">Winter (Rabi)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Get Suggestions</button>
            </form>
          </Card>
          
          <div className="crop-results">
            {suggestions.length > 0 ? (
              <Card title="Recommended Crops">
                <ul className="crop-list">
                  {suggestions.map((crop, index) => (
                    <li key={index}>{crop}</li>
                  ))}
                </ul>
              </Card>
            ) : (
              <p className="no-data">Select parameters and click Get Suggestions to see crops.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
