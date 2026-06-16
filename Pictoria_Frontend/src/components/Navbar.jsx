import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { FaEdit, FaUpload, FaUser, FaSignOutAlt, FaMagic, FaImages } from "react-icons/fa"; // Import icons
import logo from "/public/pictoria_logo.png";
import UploadModal from "./uploadmodel.jsx";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
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
    <>
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
                  <span>Generate</span>
                </button>
                <button className="nav-btn" onClick={() => navigate("/edit")}>
                  <FaEdit className="nav-icon" />
                  <span>Edit</span>
                </button>
                <button className="nav-btn" onClick={() => navigate("/gallery")}>
                  <FaImages className="nav-icon" />
                  <span>Gallery</span>
                </button>
                <button className="nav-btn" onClick={() => setShowUploadModal(true)}>
                  <FaUpload className="nav-icon" />
                  <span>Upload</span>
                </button>
                <button className="nav-btn" onClick={() => navigate("/profile")}>
                  <FaUser className="nav-icon" />
                  <span>Profile</span>
                </button>
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt className="nav-icon" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="spacer">
                  <Link to="/login">
                    <button className="nav-btn">
                      <FaUser className="nav-icon" />
                      <span>Login</span>
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="nav-btn">
                      <FaUser className="nav-icon" />
                      <span>SignUp</span>
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
      {showUploadModal && <UploadModal close={() => setShowUploadModal(false)} />}
    </>
  );
};

export default Navbar;
