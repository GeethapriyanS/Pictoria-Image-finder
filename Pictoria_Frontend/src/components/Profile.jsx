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
          <button className="edit-profile-btn">Edit Profile</button>
        </div>
        <div className="profile-tabs">
          {["Photos", "Illustrations", "Likes", "Collections", "Stats"].map(
            (tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>
        <div className="profile-content">{renderTabContent()}</div>
      </div>
    </>
  );
};

export default Profile;
