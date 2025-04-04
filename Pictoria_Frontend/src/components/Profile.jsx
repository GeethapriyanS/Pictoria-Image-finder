import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css";

const Profile = () => {
  const [userImages, setUserImages] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchUserImages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/${userId}`);
        setUserInfo(res.data.user || {});
        setUserImages(res.data.images || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchUserImages();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Welcome, {userInfo.username || "User"}!</h2>
        <p>Email: {userInfo.email}</p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h3>Your Uploaded Images</h3>
      <div className="user-image-grid">
        {userImages.length > 0 ? (
          userImages.map((img) => (
            <div key={img._id} className="user-image-card">
              <img src={img.imageUrl} alt={img.title} />
              <p>{img.title}</p>
            </div>
          ))
        ) : (
          <p>No uploads yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
