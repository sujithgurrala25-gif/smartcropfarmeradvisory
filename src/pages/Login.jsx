import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const success = login(username, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="login-logo">🌾</div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Smart Farmer Advisory System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-badge">{error}</div>}

          <div className="modern-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="modern-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
            />
          </div>

          <button type="submit" className="modern-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
