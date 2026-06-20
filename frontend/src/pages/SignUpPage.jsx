import React, { useState } from "react";
import { createUser } from "../services/api";
import { Sparkles, Mail, Lock, User } from "lucide-react";

const SignUpPage = ({ onAuthSuccess, onSwitch }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!name || !email || !password) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      setLoading(true);
      const response = await createUser({ name, email, password });

      if (response?.data?.success) {
        onAuthSuccess(response.data.data.token, response.data.data.user);
      } else {
        setStatus({
          type: "error",
          message: response?.data?.error || "Unable to create account.",
        });
      }
    } catch (error) {
      console.error("Sign-up failed", error);
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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Join ResumeAI and start optimizing your career
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <div className="input-wrapper">
              <User size={15} className="input-icon" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

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
                placeholder="Create a strong password"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {onSwitch && (
          <p className="auth-switch">
            Already have an account?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => onSwitch("Login")}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
