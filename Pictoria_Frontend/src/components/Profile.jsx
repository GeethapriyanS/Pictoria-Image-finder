import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css";
import defaultProfile from "../images/default profile.jpg";
import Navbar from "./Navbar";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Photos");
  const [userInfo, setUserInfo] = useState({});
  const [userImages, setUserImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editData, setEditData] = useState({
    username: "",
    bio: "",
    profilePicture: "",
  });

  const handleEditClick = () => {
    setEditData({
      username: userInfo.username || "",
      bio: userInfo.bio || "",
      profilePicture: userInfo.profilePicture || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        `http://localhost:5000/user/${userId}`,
        editData
      );
      setUserInfo(res.data);
      setShowEditModal(false);
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to update profile");
    }
  };

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/${userId}`);
        const { user, images = [] } = res.data;
        const likedImageIds = user?.likedImages || [];

        const likedImageObjects = images.filter((img) =>
          likedImageIds.includes(img._id)
        );

        setUserInfo(user || {});
        setUserImages(images);
        setLikedImages(likedImageObjects);
        setCollections(user?.collections || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm("Are you sure you want to delete this collection?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/user/${userId}/collection/${collectionId}`
      );
      // Remove from state
      setCollections((prev) =>
        prev.filter((collection) => collection._id !== collectionId)
      );
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Photos":
        return userImages.length > 0 ? (
          <div className="image-grid">
            {userImages.map((img) => (
              <div key={img._id} className="image-card">
                <img src={img.imageUrl} alt={img.title || "Uploaded Image"} />
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
                <p className="lock">
                  {collection.isPrivate && <FaLock size={12} />}{" "}
                  {collection.images.length} image
                  {collection.images.length !== 1 ? "s" : ""} · Created by{" "}
                  {userInfo.username}
                </p>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteCollection(collection._id)}
                >
                  Delete
                </button>
                <div className="image-grid">
                  {collection.images.length > 0 ? (
                    collection.images.map((imgId, index) => {
                      const imgObj = userImages.find(
                        (img) => img._id === imgId
                      );
                      return imgObj ? (
                        <div key={index} className="image-card">
                          <img
                            src={imgObj.imageUrl}
                            alt={imgObj.title || "Collection Image"}
                          />
                        </div>
                      ) : (
                        <p key={index}>Image not found</p>
                      );
                    })
                  ) : (
                    <p>No images in this collection.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No collections yet.</p>
        );

      case "About":
        return (
          <div className="about-section">
            <h2>About Pictoria</h2>
            <p>
              <strong>Pictoria</strong> is a modern image-sharing platform where
              users can upload, like, and organize high-quality images into
              collections. It’s built with a focus on simplicity, creativity,
              and user experience.
            </p>
            <p>
              Users can maintain their personal galleries, explore other users'
              images, and download images for free. Whether you're a designer,
              photographer, or enthusiast, Pictoria helps you showcase and
              manage your visual content effortlessly.
            </p>
            <h3>Features</h3>
            <ul>
              <li>🌄 Upload and manage your own image gallery</li>
              <li>❤️ Like and curate your favorite images</li>
              <li>📁 Create and manage collections</li>
              <li>🔐 Choose public or private collections</li>
              <li>📥 Download images directly to your device</li>
            </ul>
            <p>
              Built with <strong>MERN stack</strong> (MongoDB, Express, React,
              Node.js), and integrated with <strong>Cloudinary</strong> for
              efficient image storage.
            </p>
          </div>
        );

      case "Stats":
        return <p>Stats feature is coming soon!</p>;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-picture">
            <img
              src={userInfo.profilePicture || defaultProfile}
              alt="Profile"
            />
          </div>
          <h1>{userInfo.username || "User"}</h1>
          <p>
            {userInfo.bio ||
              "Download free, beautiful high-quality photos curated by the user."}
          </p>
          <button className="edit-profile-btn" onClick={handleEditClick}>
            Edit Profile
          </button>
        </div>
        <div className="profile-tabs">
          {["Photos", "Likes", "Collections", "About", "Stats"].map((tab) => (
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
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <h2>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <label>
                Username:
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) =>
                    setEditData({ ...editData, username: e.target.value })
                  }
                />
              </label>
              <label>
                Bio:
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                />
              </label>
              <label>
                Profile Picture URL:
                <input
                  type="url"
                  value={editData.profilePicture}
                  onChange={(e) =>
                    setEditData({ ...editData, profilePicture: e.target.value })
                  }
                />
              </label>
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
