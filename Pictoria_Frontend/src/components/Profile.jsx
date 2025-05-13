import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css";
import defaultProfile from "../images/default profile.jpg"; // Import the default profile image
import Navbar from "./Navbar";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Photos");
  const [userInfo, setUserInfo] = useState({});
  const [userImages, setUserImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [collections, setCollections] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/${userId}`);
        console.log("API Response:", res.data); // Log the API response for debugging
        setUserInfo(res.data.user || {});
        setUserImages(res.data.images || []);
        setLikedImages(res.data.likedImages || []);
        setCollections(res.data.collections || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Photos":
        return userImages.length > 0 ? (
          <div className="image-grid">
            {userImages.map((img) => (
              <div key={img._id} className="image-card">
                <img src={img.imageUrl} alt={img.title || "Uploaded Image"} /> {/* Ensure imageUrl is valid */}
              </div>
            ))}
          </div>
        ) : (
          <p>No photos uploaded yet.</p>
        );
      case "Likes":
        return likedImages.length > 0 ? (
          <div className="image-grid">
            {likedImages.map((img) => (
              <div key={img._id} className="image-card">
                <img src={img.imageUrl} alt={img.title || "Liked Image"} />
              </div>
            ))}
          </div>
        ) : (
          <p>No liked images yet.</p>
        );
      case "Collections":
        return collections.length > 0 ? (
          <div className="collection-grid">
            {collections.map((collection) => (
              <div key={collection._id} className="collection-card">
                <h4>{collection.name}</h4>
              </div>
            ))}
          </div>
        ) : (
          <p>No collections yet.</p>
        );
      case "Stats":
        return <p>Stats feature is coming soon!</p>;
      default:
        return null;
    }
  };

  return (
    <>
    <Navbar/>
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <img
            src={userInfo.profilePicture || defaultProfile} // Use default profile picture if none is set
            alt="Profile"
          />
        </div>
        <h1>{userInfo.username || "User"}</h1>
        <p>{userInfo.bio || "Download free, beautiful high-quality photos curated by the user."}</p>
        <button className="edit-profile-btn">Edit Profile</button>
      </div>
      <div className="profile-tabs">
        {["Photos", "Illustrations", "Likes", "Collections", "Stats"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="profile-content">{renderTabContent()}</div>
    </div>
    </>
  );
};

export default Profile;
