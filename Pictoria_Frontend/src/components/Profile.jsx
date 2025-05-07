import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const [userImages, setUserImages] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({ username: "", email: "" });
  
  const navigate = useNavigate();
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
    navigate("/login");
  };

  const handleEditProfile = () => {
    setEditedInfo({ username: userInfo.username, email: userInfo.email });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(`http://localhost:5000/user/update/${userId}`, editedInfo);
      setUserInfo(editedInfo);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`http://localhost:5000/user/image/${imageId}`);
      setUserImages((prev) => prev.filter((img) => img._id !== imageId));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
      <button className="back-btn" onClick={() => navigate("/home3")}>Back</button>
        <h2>Welcome, {userInfo.username || "User"}!</h2>
        <p>Email: {userInfo.email}</p>
        <div className="profile-actions">
          <button onClick={handleEditProfile} className="edit-btn">Edit Profile</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      

      <h3>Your Uploaded Images</h3>
      <div className="user-image-grid">
        {userImages.length > 0 ? (
          userImages.map((img) => (
            <div key={img._id} className="user-image-card">
              <img src={img.imageUrl} alt={img.title} />
              <div className="image-footer">
                <p>{img.title}</p>
                <button onClick={() => handleDeleteImage(img._id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No uploads yet.</p>
        )}
      </div>

      {/* Modal for Editing Profile */}
      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            <input
              type="text"
              value={editedInfo.username}
              onChange={(e) => setEditedInfo({ ...editedInfo, username: e.target.value })}
              placeholder="Username"
            />
            <input
              type="email"
              value={editedInfo.email}
              onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
              placeholder="Email"
            />
            <button onClick={handleSaveProfile} className="save-btn">Save</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
