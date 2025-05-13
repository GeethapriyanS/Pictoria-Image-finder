import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // New state for popup
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.isValid) {
        setShowPopup(true); // Show popup on successful login
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/home3");
        }, 2000); // Hide popup and navigate after 1.5 seconds
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Pictoria</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>

      {/* Popup for login success */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Login Successful!</h3>
            <p>Welcome back to Pictoria.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
