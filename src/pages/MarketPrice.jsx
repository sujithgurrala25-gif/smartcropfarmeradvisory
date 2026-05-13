import { useState, useEffect } from 'react';
import { fetchMarketPrices } from '../utils/api';
import Loader from '../components/Loader';
import Card from '../components/Card';

const MarketPrice = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const getPrices = async () => {
      try {
        const data = await fetchMarketPrices();
        if (isMounted) setPrices(data);
      } catch (err) {
        if (isMounted) setError('Failed to fetch market prices.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    getPrices();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-container">
      <h2>Market Prices</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <Loader loading={loading} message="Loading prices..." />
      
      {!loading && !error && (
        <Card title="Today's Crop Rates" className="market-card">
          <table className="market-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Price</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((item) => (
                <tr key={item.id}>
                  <td>{item.crop}</td>
                  <td>{item.price}</td>
                  <td className={`trend-${item.trend.toLowerCase()}`}>
                    {item.trend === 'Up' ? '▲' : item.trend === 'Down' ? '▼' : '▬'} {item.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default MarketPrice;
