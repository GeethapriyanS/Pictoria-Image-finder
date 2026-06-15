import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Profile.css";
import defaultProfile from "../images/default profile.jpg";
import Navbar from "./Navbar";
import { FaLock, FaUnlock, FaShareAlt, FaEdit, FaUser, FaHeart, FaDownload, FaPlus } from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Photos");
  const [userInfo, setUserInfo] = useState({});
  const [userImages, setUserImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDetailImage, setSelectedDetailImage] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDesc, setCollectionDesc] = useState("");

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

        setUserInfo(user || {});
        setUserImages(images);
        setLikedImages(user?.likedImages || []);
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

  const handleTogglePrivacy = async (collectionId, currentIsPrivate) => {
    try {
      await axios.patch(`http://localhost:5000/user/${userId}/collection/${collectionId}`, {
        isPrivate: !currentIsPrivate
      });
      setCollections(prev => prev.map(col => {
        if (col._id === collectionId) {
          return { ...col, isPrivate: !currentIsPrivate };
        }
        return col;
      }));
      alert(`Collection is now ${!currentIsPrivate ? 'Private' : 'Public'}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update collection privacy.");
    }
  };

  const handleShareCollection = (collectionId) => {
    const link = `${window.location.origin}/shared-collection/${collectionId}`;
    navigator.clipboard.writeText(link);
    alert("Shareable link copied to clipboard!");
  };

  const handleEdit = (imageUrl) => {
    navigate("/edit", { state: { imageUrl } });
  };

  const downloadImage = async (url, title = "download") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, "_blank");
    }
  };

  const handleLike = async (image) => {
    try {
      const isLiked = likedImages.some((img) => img.imageUrl === image.imageUrl);
      if (isLiked) {
        const targetImg = likedImages.find((img) => img.imageUrl === image.imageUrl);
        if (!targetImg) return;
        await axios.post(`http://localhost:5000/user/${userId}/unlike`, {
          imageId: targetImg._id,
        });
        setLikedImages((prev) => prev.filter((img) => img.imageUrl !== image.imageUrl));
        alert("Image unliked!");
      } else {
        await axios.post(`http://localhost:5000/user/${userId}/like`, {
          imageUrl: image.imageUrl,
          title: image.title,
        });
        const res = await axios.get(`http://localhost:5000/user/${userId}`);
        setLikedImages(res.data.user?.likedImages || []);
        alert("Image liked!");
      }
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const openAddToCollection = (image) => {
    setSelectedImage(image);
    setShowCollectionModal(true);
  };

  const handleAddToCollection = async () => {
    try {
      await axios.post(`http://localhost:5000/user/${userId}/collections`, {
        name: collectionName,
        description: collectionDesc,
        imageUrl: selectedImage.imageUrl,
        title: selectedImage.title,
        uploadedBy: userId,
      });
      alert("Image added to collection!");
      setShowCollectionModal(false);
      setCollectionName("");
      setCollectionDesc("");
      const res = await axios.get(`http://localhost:5000/user/${userId}`);
      setCollections(res.data.user?.collections || []);
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Photos":
        return userImages.length > 0 ? (
          <div className="image-grid">
            {userImages.map((img) => (
              <div 
                key={img._id} 
                className="image-card"
                onClick={() => setSelectedDetailImage(img)}
                style={{ cursor: "pointer" }}
              >
                <img src={img.imageUrl} alt={img.title || "Uploaded Image"} />
                <div className="image-overlay">
                  {/* Hover visual only */}
                </div>
                <div className="image-card-footer">
                  <span className="image-title">{img.title || "Untitled Artwork"}</span>
                </div>
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
              <div 
                key={img._id} 
                className="image-card"
                onClick={() => setSelectedDetailImage(img)}
                style={{ cursor: "pointer" }}
              >
                <img src={img.imageUrl} alt={img.title || "Liked Image"} />
                <div className="image-overlay">
                  {/* Hover visual only */}
                </div>
                <div className="image-card-footer">
                  <span className="image-title">{img.title || "Untitled Artwork"}</span>
                </div>
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
                <div className="collection-header">
                  <h4>{collection.name}</h4>
                  <p className="lock">
                    {collection.isPrivate ? <FaLock size={12} /> : <FaUnlock size={12} />} {" "}
                    {collection.images.length} image{collection.images.length !== 1 ? "s" : ""} · Created by {userInfo.username}
                  </p>
                </div>
                <div className="collection-actions-bar">
                  <button
                    className="privacy-toggle-btn"
                    onClick={() => handleTogglePrivacy(collection._id, collection.isPrivate)}
                  >
                    {collection.isPrivate ? "Make Public" : "Make Private"}
                  </button>
                  <button
                    className="share-btn"
                    onClick={() => handleShareCollection(collection._id)}
                  >
                    <FaShareAlt /> Share
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCollection(collection._id)}
                  >
                    Delete
                  </button>
                </div>
                <div className="image-grid">
                  {collection.images && collection.images.length > 0 ? (
                    collection.images.map((imgObj, index) => {
                      return imgObj ? (
                        <div 
                          key={imgObj._id || index} 
                          className="image-card"
                          onClick={() => setSelectedDetailImage(imgObj)}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={imgObj.imageUrl}
                            alt={imgObj.title || "Collection Image"}
                          />
                          <div className="image-overlay">
                            {/* Hover visual only */}
                          </div>
                          <div className="image-card-footer">
                            <span className="image-title">{imgObj.title || "Untitled Artwork"}</span>
                          </div>
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

      {showCollectionModal && (
        <div className="collection-modal">
          <div className="collection-modal-content">
            <h2>Add to Collection</h2>
            <input
              type="text"
              placeholder="Collection Name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={collectionDesc}
              onChange={(e) => setCollectionDesc(e.target.value)}
              rows={4}
            />
            <div className="collection-modal-buttons">
              <button className="save-btn" onClick={handleAddToCollection}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowCollectionModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDetailImage && (
        <div className="lightbox-modal" onClick={() => setSelectedDetailImage(null)}>
          <div className="lightbox-content glass glow" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setSelectedDetailImage(null)}>&times;</button>
            <div className="lightbox-body">
              <div className="lightbox-image-container">
                <img src={selectedDetailImage.imageUrl} alt={selectedDetailImage.title} />
              </div>
              <div className="lightbox-details">
                <h2>{selectedDetailImage.title || "Untitled Artwork"}</h2>
                <p className="lightbox-desc">Explore details, perform custom designs in the image editor, download, or save this asset to one of your custom collections.</p>
                
                <div className="lightbox-actions-grid">
                  <button className="lightbox-action-btn like" onClick={() => handleLike(selectedDetailImage)}>
                    <FaHeart color={likedImages.some((img) => img.imageUrl === selectedDetailImage.imageUrl) ? "#ef4444" : "#64748b"} />
                    <span>{likedImages.some((img) => img.imageUrl === selectedDetailImage.imageUrl) ? "Liked" : "Like"}</span>
                  </button>
                  
                  <button className="lightbox-action-btn download" onClick={() => downloadImage(selectedDetailImage.imageUrl, selectedDetailImage.title)}>
                    <FaDownload />
                    <span>Download</span>
                  </button>
                  
                  <button className="lightbox-action-btn edit" onClick={() => {
                    setSelectedDetailImage(null);
                    navigate("/edit", { state: { imageUrl: selectedDetailImage.imageUrl } });
                  }}>
                    <FaEdit />
                    <span>Edit Asset</span>
                  </button>
                  
                  <button className="lightbox-action-btn collection" onClick={() => openAddToCollection(selectedDetailImage)}>
                    <FaPlus />
                    <span>Add to Collection</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
