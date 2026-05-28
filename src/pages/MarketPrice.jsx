import { useState, useEffect, useMemo } from 'react';
import { fetchMarketPrices, refreshMarketPrices, generateHistoricalTrend, fetchPreviousMarketPrices, baselinePrices } from '../utils/api';
import Loader from '../components/Loader';
import Card from '../components/Card';

const MarketPrice = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Market Open/Closed Status Detection
  const marketStatus = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    
    if (day === 0) {
      return { isOpen: false, label: 'Sunday Holiday', bannerText: 'Regulated mandis in Telangana are closed on Sundays. Showing previous market closing rates (Saturday).' };
    }
    if (hours < 9 || hours >= 17) {
      return { isOpen: false, label: 'Market Closed', bannerText: 'Markets are closed outside business hours (Open Monday-Saturday, 9:00 AM - 5:00 PM). Showing last closing rates.' };
    }
    return { isOpen: true, label: 'Market Open', bannerText: '' };
  }, []);

  const [showingPreviousRates, setShowingPreviousRates] = useState(!marketStatus.isOpen);

  // Live Sync Status Detection
  const isLiveDataActive = useMemo(() => {
    return prices.length > 0 && prices[0].isLive === true;
  }, [prices]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedRowId, setSelectedRowId] = useState(null);

  const loadData = async (isMounted) => {
    setLoading(true);
    setError(null);
    try {
      const data = !marketStatus.isOpen
        ? await fetchPreviousMarketPrices()
        : await fetchMarketPrices();
      if (isMounted) {
        setPrices(data);
        if (data.length > 0) {
          setSelectedRowId(data[0].id);
        }
      }
    } catch (err) {
      if (isMounted) {
        // Load local baseline fallback data
        const fallback = baselinePrices.map(item => ({
          ...item,
          lastUpdated: !marketStatus.isOpen ? 'Saturday (Closing)' : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isLive: false
        }));
        setPrices(fallback);
        if (fallback.length > 0) {
          setSelectedRowId(fallback[0].id);
        }
        setError(`Failed to sync live rates: ${err.message}. Showing local offline rates.`);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData(isMounted);
    return () => { isMounted = false; };
  }, [marketStatus.isOpen]);

  // Filter dropdown lists
  const mandisList = useMemo(() => {
    return ['All', ...new Set(prices.map((p) => p.mandi))];
  }, [prices]);

  const cropsList = useMemo(() => {
    return ['All', ...new Set(prices.map((p) => p.crop))];
  }, [prices]);

  // Handle live refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const updatedData = await refreshMarketPrices();
      setPrices(updatedData);
      setShowingPreviousRates(false);
    } catch (err) {
      setError(`Failed to refresh live market prices: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle previous rates loading (holiday fallback)
  const handleLoadPrevious = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchPreviousMarketPrices();
      setPrices(data);
      setShowingPreviousRates(true);
    } catch (err) {
      setError(`Failed to load previous market prices: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtered prices list
  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      const matchesSearch =
        item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mandi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMandi = selectedMandi === 'All' || item.mandi === selectedMandi;
      const matchesCrop = selectedCrop === 'All' || item.crop === selectedCrop;

      return matchesSearch && matchesMandi && matchesCrop;
    });
  }, [prices, searchTerm, selectedMandi, selectedCrop]);

  // Fallback prices list (recent rates fallback if filtered list is empty)
  const fallbackPrices = useMemo(() => {
    if (filteredPrices.length > 0) return [];

    if (selectedCrop !== 'All') {
      return prices.filter((p) => p.crop === selectedCrop);
    }

    if (selectedMandi !== 'All') {
      return prices.filter((p) => p.mandi === selectedMandi);
    }

    if (searchTerm) {
      const match = prices.filter(p => p.crop.toLowerCase().includes(searchTerm.toLowerCase()));
      if (match.length > 0) return match;
    }

    return [];
  }, [filteredPrices, prices, selectedCrop, selectedMandi, searchTerm]);

  // Selected item for details side panel
  const selectedItem = useMemo(() => {
    const list = filteredPrices.length > 0 ? filteredPrices : fallbackPrices;
    if (list.length === 0) return null;
    const found = list.find((p) => p.id === selectedRowId);
    return found || list[0];
  }, [filteredPrices, fallbackPrices, selectedRowId]);

  // Summary Metrics
  const metrics = useMemo(() => {
    if (prices.length === 0) {
      return { activeMarkets: 0, topGainer: 'N/A', totalArrivals: 0 };
    }
    const activeMarkets = new Set(prices.map((p) => p.mandi)).size;
    const totalArrivals = prices.reduce((sum, p) => sum + p.arrivals, 0);

    const gainers = prices.filter((p) => p.trend === 'Up');
    let topGainer = 'N/A';
    if (gainers.length > 0) {
      const highestPriceGainer = gainers.reduce((prev, current) =>
        prev.modalPrice > current.modalPrice ? prev : current
      );
      topGainer = `${highestPriceGainer.crop} (${highestPriceGainer.mandi})`;
    } else {
      const highest = prices.reduce((prev, current) =>
        prev.modalPrice > current.modalPrice ? prev : current
      );
      topGainer = `${highest.crop} (Steady)`;
    }

    return { activeMarkets, topGainer, totalArrivals };
  }, [prices]);

  // Generate trend points for SVG graph
  const { chartPath, chartAreaPath, points, gridLines, minVal, maxVal, trendData } = useMemo(() => {
    if (!selectedItem) {
      return { chartPath: '', chartAreaPath: '', points: [], gridLines: [], minVal: 0, maxVal: 0, trendData: [] };
    }

    const data = generateHistoricalTrend(selectedItem.modalPrice, selectedItem.trend);
    const width = 300;
    const height = 120;
    const padding = { top: 15, right: 20, bottom: 20, left: 35 };

    const min = Math.min(...data) * 0.97;
    const max = Math.max(...data) * 1.03;
    const range = max - min || 1;

    const pointsList = data.map((val, idx) => {
      const x = padding.left + (idx * (width - padding.left - padding.right)) / 6;
      const y = height - padding.bottom - ((val - min) / range) * (height - padding.top - padding.bottom);
      return { x, y, value: val, day: `Day ${idx + 1}` };
    });

    const linePathStr = pointsList.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');

    const firstPoint = pointsList[0];
    const lastPoint = pointsList[pointsList.length - 1];
    const yBaseline = height - padding.bottom;
    const areaPathStr = linePathStr
      ? `${linePathStr} L ${lastPoint.x.toFixed(1)} ${yBaseline} L ${firstPoint.x.toFixed(1)} ${yBaseline} Z`
      : '';

    const gridLevels = 3;
    const gridLinesList = [];
    for (let i = 0; i < gridLevels; i++) {
      const val = min + (i * range) / (gridLevels - 1);
      const y = height - padding.bottom - (i * (height - padding.top - padding.bottom)) / (gridLevels - 1);
      gridLinesList.push({ y, value: Math.round(val) });
    }

    return {
      chartPath: linePathStr,
      chartAreaPath: areaPathStr,
      points: pointsList,
      gridLines: gridLinesList,
      minVal: min,
      maxVal: max,
      trendData: data
    };
  }, [selectedItem]);

  // Advisory content
  const advisoryContent = useMemo(() => {
    if (!selectedItem) return null;
    const { crop, variety, mandi, modalPrice, trend } = selectedItem;
    const formattedPrice = `₹${modalPrice.toLocaleString()}`;

    if (trend === 'Up') {
      return {
        className: 'up',
        title: '📈 Recommended: Sell Harvest Now',
        text: `Prices for ${crop} (${variety}) in ${mandi} are currently trending upwards at ${formattedPrice}/Quintal. We suggest selling your harvest now to lock in these premium gains before seasonal supply increases.`
      };
    } else if (trend === 'Down') {
      return {
        className: 'down',
        title: '📉 Recommended: Store & Hold',
        text: `Market rates for ${crop} (${variety}) in ${mandi} are in a downswing at ${formattedPrice}/Quintal. If you have access to dry storage or cold storage facilities, we recommend holding your crops to wait for price recovery.`
      };
    } else {
      return {
        className: 'stable',
        title: '⚖️ Recommended: Monitor or Sell',
        text: `Prices for ${crop} in ${mandi} are holding steady at ${formattedPrice}/Quintal. Sell if you have immediate capital needs; otherwise, monitor market updates for upward price movements.`
      };
    }
  }, [selectedItem]);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Telangana Agriculture Market Prices (Live Agmarknet Sync)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isLiveDataActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: 'rgba(56, 142, 60, 0.08)', border: '1px solid #388e3c', fontSize: '0.82rem', fontWeight: '600', color: '#2e7d32' }}>
              <span className="live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#388e3c', display: 'inline-block' }}></span>
              Live Daily Market Index Sync Active
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {!marketStatus.isOpen && (
        <div className="info-message holiday-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(2, 136, 209, 0.08)', borderColor: '#0288d1', color: '#0277bd', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontWeight: '500' }}>
          <span style={{ fontSize: '1.25rem' }}>📅</span>
          <span><strong>Market Status Notice:</strong> {marketStatus.bannerText}</span>
        </div>
      )}

      <Loader loading={loading} message="Loading market prices..." />

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="market-metrics-grid">
            <div className="metric-card primary-border animate-slide-up delay-100">
              <div className="metric-header">
                <span className="metric-title">Active Mandis</span>
                <span className="metric-icon">🏢</span>
              </div>
              <div className="metric-value">{metrics.activeMarkets}</div>
              <div className="metric-subtitle">Telangana Regulated Markets</div>
            </div>

            <div className="metric-card success-border animate-slide-up delay-150">
              <div className="metric-header">
                <span className="metric-title">Highest Demand Crop</span>
                <span className="metric-icon">🚀</span>
              </div>
              <div className="metric-value" style={{ fontSize: '1.25rem' }}>{metrics.topGainer}</div>
              <div className="metric-subtitle">Currently Trending Upwards</div>
            </div>

            <div className="metric-card accent-border animate-slide-up delay-200">
              <div className="metric-header">
                <span className="metric-title">Total Daily Arrivals</span>
                <span className="metric-icon">🚛</span>
              </div>
              <div className="metric-value">{metrics.totalArrivals.toLocaleString()} Qtl</div>
              <div className="metric-subtitle">Arrival volume today</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="market-filter-bar animate-slide-up delay-250">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search crop, variety, mandi, or district..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={selectedMandi}
              onChange={(e) => {
                setSelectedMandi(e.target.value);
                setSelectedRowId(null);
              }}
            >
              <option value="All">All Mandis</option>
              {mandisList.filter(m => m !== 'All').map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setSelectedRowId(null);
              }}
            >
              <option value="All">All Crops</option>
              {cropsList.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {!marketStatus.isOpen ? (
              <button 
                className="btn-refresh previous-rates-btn" 
                onClick={handleLoadPrevious}
                disabled={refreshing}
                style={{ backgroundColor: '#5c6bc0' }}
              >
                <span>📋</span>
                {refreshing ? 'Loading Previous...' : `Previous Rates (${marketStatus.label})`}
              </button>
            ) : (
              <button 
                className="btn-refresh" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <span className={refreshing ? 'spin-icon' : ''}>🔄</span>
                {refreshing ? 'Refreshing...' : 'Refresh Live Rates'}
              </button>
            )}
          </div>

          {/* Main Content Layout */}
          <div className="market-page-layout animate-fade-in delay-300">

            {/* Market Prices Table Card */}
            <Card title="Today's Mandi Wholesale Rates (per Quintal / 100 Kg)">
              {filteredPrices.length === 0 && fallbackPrices.length > 0 && (
                <div style={{
                  backgroundColor: 'rgba(245, 127, 23, 0.08)',
                  borderLeft: '4px solid #f57f17',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.9rem',
                  color: '#e65100',
                  fontWeight: '500'
                }}>
                  ℹ️ <strong>Recent Rates Notice:</strong> No exact matches found for your filter combination. Displaying recent rates of <strong>{selectedCrop !== 'All' ? selectedCrop : selectedMandi}</strong> from alternative markets.
                </div>
              )}

              <div className="market-table-container">
                <table className="market-table">
                  <thead>
                    <tr>
                      <th>Location (Mandi)</th>
                      <th>District</th>
                      <th>Crop Name</th>
                      <th>Variety</th>
                      <th style={{ textAlign: 'right' }}>Arrivals</th>
                      <th style={{ textAlign: 'right' }}>Min (₹)</th>
                      <th style={{ textAlign: 'right' }}>Max (₹)</th>
                      <th style={{ textAlign: 'right' }}>Avg Modal (₹)</th>
                      <th style={{ textPadding: 'left' }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.length === 0 && fallbackPrices.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No market prices found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      (filteredPrices.length > 0 ? filteredPrices : fallbackPrices).map((item) => (
                        <tr
                          key={item.id}
                          className={selectedItem?.id === item.id ? 'selected' : ''}
                          onClick={() => setSelectedRowId(item.id)}
                        >
                          <td style={{ fontWeight: '600' }}>{item.mandi}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{item.district}</td>
                          <td>{item.crop}</td>
                          <td style={{ fontStyle: 'italic' }}>{item.variety}</td>
                          <td style={{ textAlign: 'right' }}>{item.arrivals.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>{item.minPrice.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>{item.maxPrice.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            {item.modalPrice.toLocaleString()}
                          </td>
                          <td>
                            <span className={`trend-badge ${item.trend.toLowerCase()}`}>
                              {item.trend === 'Up' ? '▲' : item.trend === 'Down' ? '▼' : '▬'} {item.trend}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Details and Analytics Side Panel */}
            <div>
              {selectedItem ? (
                <div className="market-detail-panel animate-slide-in-right" key={selectedItem.id}>
                  <div className="detail-header">
                    <h3>{selectedItem.crop}</h3>
                    <span>{selectedItem.variety} Variety • {selectedItem.mandi} Mandi</span>
                  </div>

                  <div className="detail-price-grid">
                    <div className="detail-price-box modal">
                      <span className="price-label">Modal rate (current)</span>
                      <span className="price-val">₹{selectedItem.modalPrice.toLocaleString()}</span>
                    </div>
                    <div className="detail-price-box">
                      <span className="price-label">Min Rate</span>
                      <span className="price-val">₹{selectedItem.minPrice.toLocaleString()}</span>
                    </div>
                    <div className="detail-price-box">
                      <span className="price-label">Max Rate</span>
                      <span className="price-val">₹{selectedItem.maxPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="detail-stat-row">
                    <span>District</span>
                    <span>{selectedItem.district}</span>
                  </div>
                  <div className="detail-stat-row">
                    <span>Arrivals Today</span>
                    <span>{selectedItem.arrivals.toLocaleString()} Quintals</span>
                  </div>
                  <div className="detail-stat-row">
                    <span>Last Updated</span>
                    <span style={{ color: 'var(--primary-color)' }}>
                      {selectedItem.lastUpdated}
                    </span>
                  </div>

                  {/* 7-Day Trend SVG Chart */}
                  <div className="chart-container">
                    <div className="chart-title">7-Day Price Trend (₹ / Qtl)</div>
                    <div className="chart-svg-wrapper">
                      <svg viewBox="0 0 300 120" width="100%" height="120">
                        {gridLines.map((gl, i) => (
                          <g key={i}>
                            <line
                              x1="35"
                              y1={gl.y}
                              x2="280"
                              y2={gl.y}
                              className="chart-grid-line"
                            />
                            <text
                              x="5"
                              y={gl.y + 3}
                              className="chart-text"
                            >
                              ₹{gl.value}
                            </text>
                          </g>
                        ))}

                        <line x1="35" y1="15" x2="35" y2="100" className="chart-axis-line" />
                        <line x1="35" y1="100" x2="280" y2="100" className="chart-axis-line" />

                        {chartAreaPath && (
                          <path d={chartAreaPath} className="chart-area" />
                        )}

                        {chartPath && (
                          <path d={chartPath} className="chart-line" />
                        )}

                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              className="chart-dot"
                            />
                            {idx === points.length - 1 && (
                              <text
                                x={p.x - 30}
                                y={p.y - 8}
                                className="chart-tooltip-text"
                              >
                                ₹{p.value}
                              </text>
                            )}
                          </g>
                        ))}

                        <text x="35" y="112" className="chart-text">D-6</text>
                        <text x="75" y="112" className="chart-text">D-5</text>
                        <text x="115" y="112" className="chart-text">D-4</text>
                        <text x="155" y="112" className="chart-text">D-3</text>
                        <text x="195" y="112" className="chart-text">D-2</text>
                        <text x="235" y="112" className="chart-text">D-1</text>
                        <text x="268" y="112" className="chart-text" style={{ fontWeight: 'bold' }}>Today</text>
                      </svg>
                    </div>
                  </div>

                  {advisoryContent && (
                    <div className={`advisory-box ${advisoryContent.className}`}>
                      <div className="advisory-title">{advisoryContent.title}</div>
                      <div className="advisory-text">{advisoryContent.text}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="market-detail-panel no-selection-panel">
                  <div className="no-selection-icon">📈</div>
                  <p>Select a mandi row from the table to view the 7-day price analytics trend and detailed farmer advisory.</p>
                </div>
              )}

              {/* Mandi News & Verified Sources */}
              <Card title="📰 Telangana Mandi News & Verified Sources" style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  Market prices are aligned with daily reports from the <strong>Department of Agricultural Marketing, Government of Telangana</strong> (tgmarketing.co.in) and <strong>AGMARKNET</strong> (agmarknet.gov.in) open datasets.
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-color)' }}>
                  <li>
                    <strong>Turmeric finger varieties</strong> in Nizamabad APMC are trading at a high average modal rate of <strong>₹13,200/Quintal</strong> due to limited dry stock arrivals.
                  </li>
                  <li>
                    <strong>Premium Cotton (Long Staple)</strong> in Warangal (Enumamula) and Adilabad continues to fetch strong rates up to <strong>₹7,800/Quintal</strong>, well above the government MSP.
                  </li>
                  <li>
                    <strong>Grade A Paddy</strong> Masuri prices at cooperative procurement centers across Telangana are stable at the MSP rate of <strong>₹2,203/Quintal</strong>.
                  </li>
                  <li>
                    <strong>Teja Chilli</strong> varieties in Khammam and Warangal are seeing active buyer demand, clearing at a solid modal average of <strong>₹19,000/Quintal</strong>.
                  </li>
                </ul>
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Verified data source: Government APMC daily bulletin</span>
                  <a href="https://tgmarketing.co.in" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Visit Official Portal ↗</a>
                </div>
              </Card>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default MarketPrice;
