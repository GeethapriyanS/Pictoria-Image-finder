import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Profile.css";
import Navbar from "./Navbar";
import API_BASE_URL from "../config";
import { FaLock, FaUnlock, FaShareAlt, FaEdit, FaHeart, FaDownload, FaPlus } from "react-icons/fa";

const Gallery = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [selectedDetailImage, setSelectedDetailImage] = useState(null);
  const [likedImageUrls, setLikedImageUrls] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDesc, setCollectionDesc] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user/${userId}`);
        const { user } = res.data;
        setCollections(user?.collections || []);
        const likedImageObjects = user?.likedImages || [];
        setLikedImageUrls(likedImageObjects.map(img => img.imageUrl));
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleLike = async (image) => {
    try {
      if (likedImageUrls.includes(image.imageUrl)) {
        const res = await axios.get(`${API_BASE_URL}/user/${userId}`);
        const targetImg = res.data.user?.likedImages.find(img => img.imageUrl === image.imageUrl);
        if (!targetImg) return;
        
        await axios.post(`${API_BASE_URL}/user/${userId}/unlike`, {
          imageId: targetImg._id,
        });
        setLikedImageUrls(prev => prev.filter(url => url !== image.imageUrl));
        alert("Image unliked!");
      } else {
        await axios.post(`${API_BASE_URL}/user/${userId}/like`, {
          imageUrl: image.imageUrl,
          title: image.title,
        });
        setLikedImageUrls(prev => [...prev, image.imageUrl]);
        alert("Image liked!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddToCollection = (image) => {
    setSelectedImage(image);
    setShowCollectionModal(true);
  };

  const handleAddToCollection = async () => {
    try {
      await axios.post(`${API_BASE_URL}/user/${userId}/collections`, {
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
      const res = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setCollections(res.data.user?.collections || []);
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/user/${userId}/collection/${collectionId}`
      );
      setCollections((prev) => prev.filter((c) => c._id !== collectionId));
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection");
    }
  };

  const handleTogglePrivacy = async (collectionId, currentIsPrivate) => {
    try {
      await axios.patch(`${API_BASE_URL}/user/${userId}/collection/${collectionId}`, {
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
      alert("Failed to toggle privacy.");
    }
  };

  const handleShareCollection = (collectionId) => {
    const link = `${window.location.origin}/shared-collection/${collectionId}`;
    navigator.clipboard.writeText(link);
    alert("Shareable link copied to clipboard!");
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

  const handleEdit = (imageUrl) => {
    navigate("/edit", { state: { imageUrl } });
  };

  return (
    <>
      <Navbar />
      <div className="gallery-container">
        <h2 className="gallery-title">Your Collections</h2>
        {collections.length > 0 ? (
          <div className="collection-grid">
            {collections.map((collection) => (
              <div key={collection._id} className="collection-card">
                <div className="collection-header">
                  <h4>{collection.name}</h4>
                  <p className="lock">
                    {collection.isPrivate ? <FaLock size={12} /> : <FaUnlock size={12} />} ·{" "}
                    {collection.images.length} image{collection.images.length !== 1 ? "s" : ""}
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
                    Delete Collection
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
                            className="gallery-img"
                          />
                          <div className="image-overlay">
                            {/* Hover effect only */}
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
          <p className="no-collection">No collections created yet.</p>
        )}
      </div>

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
                    <FaHeart color={likedImageUrls.includes(selectedDetailImage.imageUrl) ? "#ef4444" : "#64748b"} />
                    <span>{likedImageUrls.includes(selectedDetailImage.imageUrl) ? "Liked" : "Like"}</span>
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

export default Gallery;
