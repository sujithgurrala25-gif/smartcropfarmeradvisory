import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { login, register, isFirebase } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleToggleMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "login") {
      const result = await login(username, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        if (result.code === "USER_NOT_FOUND") {
          setError(
            isFirebase
              ? "Account not found. Please click 'Register' to sign up."
              : "Account not found. Please switch to the 'Register' tab to create your account."
          );
        } else {
          setError(result.message);
        }
      }
    } else {
      const result = await register(username, password);
      if (result.success) {
        setSuccessMsg(result.message);
        // Switch to login tab after brief delay
        setTimeout(() => {
          setMode("login");
          setError("");
        }, 1500);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="login-logo">🌾</div>
          <h2 className="login-title">Smart Farmer Advisory</h2>
          <p className="login-subtitle">Agricultural Insights & Mandi Market Rates</p>
        </div>

        {/* Form Selector Tabs */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleToggleMode('login')}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleToggleMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-badge">{error}</div>}
          {successMsg && <div className="success-badge">{successMsg}</div>}

          <div className="modern-form-group">
            <label htmlFor="username">{isFirebase ? 'Email Address' : 'Username'}</label>
            <input
              type="text"
              id="username"
              className="modern-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isFirebase ? "Enter your email" : "Enter your username"}
              autoComplete="username"
            />
          </div>

          <div className="modern-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="modern-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="modern-btn">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mode-toggle-link" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {mode === 'login' ? (
            <span>
              New to Smart Farmer?{' '}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => handleToggleMode('register')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => handleToggleMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                Sign In here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
