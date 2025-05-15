import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { FaEdit, FaUpload, FaUser, FaSignOutAlt, FaMagic, FaImages } from "react-icons/fa"; // Import icons
import logo from "../images/logo.png"; // Import the logo

const Navbar = ({ setShowUpload }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("token");
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-container" onClick={() => navigate("/home3")}>
          <img src={logo} alt="Pictoria Logo" className="navbar-logo" />
          <span className="navbar-title">Pictoria</span>
        </div>
        <div className="nav-buttons">
          {isLoggedIn ? (
            <>
              <button className="nav-btn" onClick={() => navigate("/generate")}>
                <FaMagic className="nav-icon" />
                Generate
              </button>
              <button className="nav-btn" onClick={() => navigate("/edit")}>
                <FaEdit className="nav-icon" />
                Edit
              </button>
              <button className="nav-btn" onClick={() => navigate("/gallery")}>
                <FaImages className="nav-icon" />
                Gallery
              </button>
              <button className="nav-btn" onClick={() => setShowUpload(true)}>
                <FaUpload className="nav-icon" />
                Upload
              </button>
              <button className="nav-btn" onClick={() => navigate("/profile")}>
                <FaUser className="nav-icon" />
                Profile
              </button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                <FaSignOutAlt className="nav-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="spacer">
              <Link to="/login">
                <button className="nav-btn">
                  <FaUser className="nav-icon" />
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="nav-btn">
                  <FaUser className="nav-icon" />
                  SignUp
                </button>
              </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
