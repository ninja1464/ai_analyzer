import React, { useState } from "react";
import { loginUser } from "../services/api";

const LoginPage = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!email || !password) {
      setStatus({
        type: "error",
        message: "Please enter your email and password.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({ email, password });

      if (response?.data?.success) {
        onAuthSuccess(response.data.data.token, response.data.data.user);
      } else {
        setStatus({
          type: "error",
          message: response?.data?.error || "Login failed.",
        });
      }
    } catch (error) {
      console.error("Login failed", error);
      setStatus({
        type: "error",
        message: "Unable to connect to the backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Login</span>
          <h2>Welcome back</h2>
          <p className="panel-description">
            Sign in to continue to your saved resume insights, projects, and job
            matches.
          </p>
        </div>
      </div>

      <section className="card signup-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {status && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
