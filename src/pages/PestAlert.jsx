import { useState, useEffect, useRef } from 'react';
import { fetchPests } from '../utils/api';
import { isGeminiConfigured, analyzePestPhoto, testGeminiApiKey } from '../utils/gemini';
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

  // Gemini API Key state
  const [geminiConfigured, setGeminiConfigured] = useState(isGeminiConfigured());
  const [showConfig, setShowConfig] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [showApiKeyText, setShowApiKeyText] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [configFeedback, setConfigFeedback] = useState(null);

  const fileInputRef = useRef(null);

  // Load API key from local storage on mount
  useEffect(() => {
    const key = localStorage.getItem("VITE_GEMINI_API_KEY") || "";
    setTempApiKey(key);
  }, []);

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      setConfigFeedback({ type: 'error', message: 'Please enter a valid key.' });
      return;
    }
    
    setIsValidatingKey(true);
    setConfigFeedback(null);
    try {
      await testGeminiApiKey(tempApiKey.trim());
      localStorage.setItem("VITE_GEMINI_API_KEY", tempApiKey.trim());
      setGeminiConfigured(true);
      setConfigFeedback({ type: 'success', message: 'Gemini API key verified and saved!' });
      setTimeout(() => {
        setShowConfig(false);
        setConfigFeedback(null);
      }, 1500);
    } catch (err) {
      setConfigFeedback({ type: 'error', message: `Verification failed: ${err.message}` });
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("VITE_GEMINI_API_KEY");
    setTempApiKey("");
    setGeminiConfigured(false);
    setConfigFeedback({ type: 'success', message: 'API key cleared. Offline simulation active.' });
    setTimeout(() => {
      setConfigFeedback(null);
    }, 2000);
  };

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
      if (result.isValid === false) {
        setScanError(result.organicControl || "Invalid Image: The uploaded photo does not appear to contain a plant, crop leaf, pest, or insect. Please upload a valid crop-related image.");
        setScanResult(null);
      } else {
        setScanResult(result);
      }
    } catch (err) {
      setScanError(`AI scan failed: ${err.message || "Please check your network and key configuration."}`);
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="page-container">
      <h2 className="animate-slide-up">Pest Management</h2>
      <p className="animate-slide-up delay-100" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Identify crop pests and obtain treatment methods using Google Gemini AI diagnosis, or check regional outbreak reports.
      </p>

      {/* AI Diagnosis Section */}
      <div className="ai-diagnosis-container animate-fade-in delay-150">
        
        {/* Upload Card */}
        <div className="ai-upload-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3>🔍 AI Pest Diagnosis</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {geminiConfigured ? (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '20px', 
                  backgroundColor: 'rgba(56, 142, 60, 0.08)', 
                  border: '1px solid #388e3c', 
                  fontSize: '0.7rem', 
                  fontWeight: '600', 
                  color: '#2e7d32' 
                }}>
                  <span className="live-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#388e3c', display: 'inline-block' }}></span>
                  Gemini AI Active
                </div>
              ) : (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '20px', 
                  backgroundColor: 'rgba(100, 100, 100, 0.08)', 
                  border: '1px solid #777777', 
                  fontSize: '0.7rem', 
                  fontWeight: '600', 
                  color: '#666666' 
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#777777', display: 'inline-block' }}></span>
                  Simulation Mode (Offline)
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => {
                  setShowConfig(!showConfig);
                  setConfigFeedback(null);
                }}
                className="btn-config-toggle"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  padding: '0.25rem 0.5rem'
                }}
              >
                {showConfig ? 'Hide Config' : 'Configure Key'}
              </button>
            </div>
          </div>
          <p className="ai-description">
            Upload an image of a pest, insect, or leaf infection from your crop. Our model will identify it and output organic and chemical solutions.
          </p>

          {showConfig && (
            <div className="api-config-panel animate-slide-up" style={{
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              marginBottom: '1.25rem',
              marginTop: '-0.5rem'
            }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                🔑 Gemini API Key Settings
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                Paste your Google Gemini API key to enable live crop leaf scan diagnostics. Get a key at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'underline' }}>Google AI Studio</a>.
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <input 
                  type={showApiKeyText ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-color)',
                    fontSize: '0.8rem',
                    fontFamily: tempApiKey ? 'monospace' : 'inherit'
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setShowApiKeyText(!showApiKeyText)}
                  style={{
                    padding: '0.45rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem'
                  }}
                  title={showApiKeyText ? "Hide key" : "Show key"}
                >
                  {showApiKeyText ? '👁️' : '🔒'}
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={isValidatingKey}
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: isValidatingKey ? 0.7 : 1
                  }}
                >
                  {isValidatingKey ? 'Verifying...' : 'Save & Verify'}
                </button>
                
                {localStorage.getItem("VITE_GEMINI_API_KEY") && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--error-color)',
                      border: '1px solid var(--error-color)',
                      borderRadius: '4px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Key
                  </button>
                )}
              </div>
              
              {configFeedback && (
                <div style={{ 
                  marginTop: '0.55rem', 
                  fontSize: '0.75rem', 
                  fontWeight: '500',
                  color: configFeedback.type === 'success' ? '#2e7d32' : 'var(--error-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>{configFeedback.type === 'success' ? '✅' : '❌'}</span>
                  <span>{configFeedback.message}</span>
                </div>
              )}
            </div>
          )}

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
            <div className="ai-result-grid animate-slide-up" key={scanResult.name}>
              
              {/* Header */}
              <div className="ai-result-header">
                <div className="ai-result-header-main" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="ai-pest-title">{scanResult.name}</span>
                  <span className={`ai-severity-badge ${scanResult.severity.toLowerCase()}`}>
                    {scanResult.severity} Severity
                  </span>
                  {scanResult.isSimulated && (
                    <span className="ai-severity-badge" style={{
                      backgroundColor: 'rgba(100, 100, 100, 0.08)',
                      border: '1px solid #777777',
                      color: '#666666'
                    }}>
                      Simulated Offline Result
                    </span>
                  )}
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
          {pests.map((pest, index) => (
            <div 
              key={pest.id} 
              className="animate-slide-up" 
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <PestCard pest={pest} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PestAlert;
