import { useState, useEffect } from 'react';
import { fetchPests } from '../utils/api';
import Loader from '../components/Loader';
import PestCard from '../components/PestCard';

const PestAlert = () => {
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const getPests = async () => {
      try {
        const data = await fetchPests();
        if (isMounted) {
          setPests(data);
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch pest alerts.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getPests();

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-container">
      <h2>Pest Alerts</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <Loader loading={loading} message="Loading recent alerts..." />
      
      {!loading && !error && (
        <div className="pest-grid">
          {pests.map((pest) => (
            <PestCard key={pest.id} pest={pest} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PestAlert;
