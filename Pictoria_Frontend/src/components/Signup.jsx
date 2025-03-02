import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/signup.css";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigator=useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, username, password }),
    });
  
    const data = await response.json();
    if(data.status){
    alert(data.message);
    setTimeout(() => {
        navigator("/login");
    }, 2000);
    }else{
       alert(data.message);
    }
  };
  

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Join Pictoria</h2>
        <form onSubmit={handleSignup}>
          <div className="name-fields">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password (min. 8 characters)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="8"
            required
          />

          <button type="submit">Join</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
