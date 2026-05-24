import { useState, useEffect, useRef } from 'react';
import { fetchPests } from '../utils/api';
import { isGeminiConfigured, analyzePestPhoto } from '../utils/gemini';
import Loader from '../components/Loader';
import PestCard from '../components/PestCard';

const PestAlert = () => {
  // Region Outbreak alerts state
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Pest Diagnosis state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [imageMimeType, setImageMimeType] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

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

  // Convert file to Base64
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setScanError("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    setScanError("");
    setScanResult(null);
    setImageMimeType(file.type);
    
    // Create preview URL
    setSelectedImage(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      // Extract the raw base64 string without metadata header
      const base64String = reader.result.split(',')[1];
      setImageBase64(base64String);
    };
    reader.onerror = () => {
      setScanError("Error reading image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleCancelImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setImageBase64("");
    setImageMimeType("");
    setScanResult(null);
    setScanError("");
  };

  const handleScan = async () => {
    if (!imageBase64) return;
    
    try {
      setIsScanning(true);
      setScanError("");
      const result = await analyzePestPhoto(imageBase64, imageMimeType);
      setScanResult(result);
    } catch (err) {
      setScanError("AI scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="page-container">
      <h2>Pest Management</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Identify crop pests and obtain treatment methods using Google Gemini AI diagnosis, or check regional outbreak reports.
      </p>

      {/* AI Diagnosis Section */}
      <div className="ai-diagnosis-container">
        
        {/* Upload Card */}
        <div className="ai-upload-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3>🔍 AI Pest Diagnosis</h3>
            
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '20px', 
              backgroundColor: isGeminiConfigured ? 'rgba(56, 142, 60, 0.08)' : 'rgba(2, 136, 209, 0.08)', 
              border: `1px solid ${isGeminiConfigured ? '#388e3c' : '#0288d1'}`, 
              fontSize: '0.7rem', 
              fontWeight: '600', 
              color: isGeminiConfigured ? '#2e7d32' : '#01579b' 
            }}>
              <span className={isGeminiConfigured ? "live-pulse" : ""} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isGeminiConfigured ? '#388e3c' : '#0288d1', display: 'inline-block' }}></span>
              {isGeminiConfigured ? 'Gemini AI Connected' : 'Offline AI Simulator'}
            </div>
          </div>
          <p className="ai-description">
            Upload an image of a pest, insect, or leaf infection from your crop. Our model will identify it and output organic and chemical solutions.
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            style={{ display: 'none' }}
          />

          {!selectedImage ? (
            <div 
              className={`pest-dropzone ${isDragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <span className="dropzone-icon">📸</span>
              <span className="dropzone-text">Drag and drop your pest image here</span>
              <span className="dropzone-subtext">or click to browse from device</span>
            </div>
          ) : (
            <div className="preview-container">
              <div className="scanner-visual-wrapper">
                {isScanning && <div className="scanner-laser-bar"></div>}
                {isScanning && <div className="scan-overlay-blur"></div>}
                <img src={selectedImage} alt="Crop pest preview" className="preview-img" />
              </div>
              
              <div className="preview-actions">
                <button 
                  type="button" 
                  onClick={handleScan} 
                  className="btn-scan"
                  disabled={isScanning}
                >
                  {isScanning ? '🔍 Scanning Image...' : '⚡ Scan with AI'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelImage} 
                  className="btn-cancel-upload"
                  disabled={isScanning}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {scanError && <p className="error-message" style={{ marginTop: '0.75rem' }}>{scanError}</p>}
        </div>

        {/* AI Result Card */}
        <div className="ai-result-card">
          <h3>📋 Diagnosis Results</h3>
          
          {isScanning && (
            <div className="ai-scan-placeholder">
              <Loader loading={true} message="AI is running image classification & diagnosing treatments..." />
            </div>
          )}

          {!isScanning && !scanResult && (
            <div className="ai-scan-placeholder">
              <span className="scan-placeholder-icon">🌱</span>
              <p style={{ fontWeight: '600' }}>No active scan</p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Please upload a photo in the scanner panel and click "Scan with AI" to generate real-time botanical recommendations.
              </p>
            </div>
          )}

          {!isScanning && scanResult && (
            <div className="ai-result-grid">
              
              {/* Header */}
              <div className="ai-result-header">
                <div className="ai-result-header-main">
                  <span className="ai-pest-title">{scanResult.name}</span>
                  <span className={`ai-severity-badge ${scanResult.severity.toLowerCase()}`}>
                    {scanResult.severity} Severity
                  </span>
                </div>
                <span className="ai-pest-subtitle"><strong>Host Crop:</strong> {scanResult.crop}</span>
              </div>

              {/* Methods Details */}
              <div className="ai-methods-grid">
                
                <div className="ai-method-box organic">
                  <span className="ai-method-title">🌿 Organic & Biological remedies</span>
                  <p className="ai-method-text">{scanResult.organicControl}</p>
                </div>

                <div className="ai-method-box chemical">
                  <span className="ai-method-title">🧪 Chemical & Pesticide treatment</span>
                  <p className="ai-method-text">{scanResult.chemicalControl}</p>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '2.5rem 0' }} />

      {/* Regional Alerts Grid */}
      <h3>📢 Regional Pest Outbreak Alerts</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
        Recent reported pest infestations in your state and advisory warnings.
      </p>

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
