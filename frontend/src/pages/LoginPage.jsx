import React, { useState } from "react";
import { loginUser } from "../services/api";
import { Sparkles, Mail, Lock } from "lucide-react";

const LoginPage = ({ onAuthSuccess, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!email || !password) {
      setStatus({ type: "error", message: "Please enter your email and password." });
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({ email, password });

      if (response?.data?.success) {
        onAuthSuccess(response.data.data.token, response.data.data.user);
      } else {
        setStatus({ type: "error", message: response?.data?.error || "Login failed." });
      }
    } catch (error) {
      console.error("Login failed", error);
      setStatus({ type: "error", message: "Unable to connect to the backend." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Sparkles size={22} />
          <span>ResumeAI</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to continue to your career dashboard
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={15} className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {status && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {onSwitch && (
          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => onSwitch("Sign Up")}
            >
              Create one
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
