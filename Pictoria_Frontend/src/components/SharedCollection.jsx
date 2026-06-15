import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaDownload, FaEdit, FaPlus, FaHeart, FaUser, FaFolderPlus } from "react-icons/fa";
import Navbar from "./Navbar";
import "../css/Profile.css"; // Reuse card and modal styling

const SharedCollection = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [targetCollectionName, setTargetCollectionName] = useState("");
  const [targetCollectionDesc, setTargetCollectionDesc] = useState("");
  const [likedImageUrls, setLikedImageUrls] = useState([]);
  const [selectedDetailImage, setSelectedDetailImage] = useState(null);
  
  const currentUserId = localStorage.getItem("userId");
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchSharedCollection = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = {};
        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await axios.get(`http://localhost:5000/shared-collection/${collectionId}`, { headers });
        if (res.data.success) {
          setCollection(res.data.collection);
          setOwner(res.data.owner);
        } else {
          setError("Failed to load collection.");
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          setError("This collection is private.");
        } else if (err.response?.status === 404) {
          setError("Collection not found.");
        } else {
          setError("Error loading collection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedCollection();
  }, [collectionId]);

  useEffect(() => {
    // If logged in, fetch current user's liked images to show like status
    const fetchCurrentUserLikes = async () => {
      if (!currentUserId) return;
      try {
        const res = await axios.get(`http://localhost:5000/user/${currentUserId}`);
        const likedImageObjects = res.data.user?.likedImages || [];
        setLikedImageUrls(likedImageObjects.map(img => img.imageUrl));
      } catch (err) {
        console.error("Failed to fetch user likes", err);
      }
    };
    if (isLoggedIn) {
      fetchCurrentUserLikes();
    }
  }, [currentUserId, isLoggedIn]);

  const handleDownload = async (imageUrl, title) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title || "shared-image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(imageUrl, "_blank");
    }
  };

  const handleEdit = (imageUrl) => {
    navigate("/edit", { state: { imageUrl } });
  };

  const handleLike = async (image) => {
    if (!isLoggedIn) {
      alert("Please log in to like this image.");
      navigate("/login");
      return;
    }
    try {
      if (likedImageUrls.includes(image.imageUrl)) {
        await axios.post(`http://localhost:5000/user/${currentUserId}/unlike`, {
          imageId: image._id,
        });
        setLikedImageUrls(prev => prev.filter(url => url !== image.imageUrl));
      } else {
        await axios.post(`http://localhost:5000/user/${currentUserId}/like`, {
          imageUrl: image.imageUrl,
          title: image.title,
        });
        setLikedImageUrls(prev => [...prev, image.imageUrl]);
      }
    } catch (err) {
      console.error("Error liking image", err);
    }
  };

  const openSaveModal = (image) => {
    if (!isLoggedIn) {
      alert("Please log in to save to your collections.");
      navigate("/login");
      return;
    }
    setSelectedImage(image);
    setShowSaveModal(true);
  };

  const saveToMyCollection = async () => {
    if (!selectedImage) return;
    try {
      await axios.post(`http://localhost:5000/user/${currentUserId}/collections`, {
        name: targetCollectionName,
        description: targetCollectionDesc,
        imageUrl: selectedImage.imageUrl,
        title: selectedImage.title,
      });
      alert("Added to collection!");
      setShowSaveModal(false);
      setTargetCollectionName("");
      setTargetCollectionDesc("");
    } catch (err) {
      console.error(err);
      alert("Failed to save image.");
    }
  };

  const handleSaveWholeCollection = async () => {
    if (!isLoggedIn) {
      alert("Please log in to save collections.");
      navigate("/login");
      return;
    }
    if (!collection || !collection.images.length) return;
    const confirmSave = window.confirm(`Save all ${collection.images.length} images to your collections?`);
    if (!confirmSave) return;

    try {
      const collectionName = prompt("Enter a name for the new collection:", `Copy of ${collection.name}`);
      if (!collectionName) return;

      // Sequentially add images
      for (const img of collection.images) {
        await axios.post(`http://localhost:5000/user/${currentUserId}/collections`, {
          name: collectionName,
          description: `Imported from ${owner.username}'s collection.`,
          imageUrl: img.imageUrl,
          title: img.title,
        });
      }
      alert("Successfully imported collection!");
    } catch (err) {
      console.error(err);
      alert("Error copying collection.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="shared-collection-loading">
          <p>Loading collection...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="shared-collection-error-container">
          <div className="error-card">
            <h2>Oops!</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/home3")}>Go Back Home</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="shared-collection-container">
        <header className="shared-collection-header">
          <div className="owner-badge">
            <span className="owner-avatar">
              <FaUser size={16} />
            </span>
            <span className="owner-name">Curated by {owner?.username}</span>
          </div>
          <h1 className="collection-title">{collection?.name}</h1>
          {collection?.description && <p className="collection-desc">{collection.description}</p>}
          <div className="collection-meta">
            <span>{collection?.images.length} image{collection?.images.length !== 1 ? "s" : ""}</span>
            {isLoggedIn && (
              <button className="import-collection-btn" onClick={handleSaveWholeCollection}>
                <FaFolderPlus /> Save Collection to Profile
              </button>
            )}
          </div>
        </header>

        {collection?.images.length > 0 ? (
          <div className="image-grid">
            {collection.images.map((image) => (
              <div 
                className="image-card" 
                key={image._id}
                onClick={() => setSelectedDetailImage(image)}
                style={{ cursor: "pointer" }}
              >
                <img src={image.imageUrl} alt={image.title} />
                <div className="image-overlay">
                  {/* Hover effect only */}
                </div>
                <div className="image-card-footer">
                  <span className="image-title">{image.title || "Untitled Artwork"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-collection-message">No images in this collection.</p>
        )}

        {showSaveModal && (
          <div className="collection-modal">
            <div className="collection-modal-content">
              <h2>Save to My Collection</h2>
              <input
                type="text"
                placeholder="Collection Name (creates new or adds to existing)"
                value={targetCollectionName}
                onChange={(e) => setTargetCollectionName(e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={targetCollectionDesc}
                onChange={(e) => setTargetCollectionDesc(e.target.value)}
                rows={3}
              />
              <div className="collection-modal-buttons">
                <button className="save-btn" onClick={saveToMyCollection}>
                  Save
                </button>
                <button className="cancel-btn" onClick={() => setShowSaveModal(false)}>
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
                    
                    <button className="lightbox-action-btn download" onClick={() => handleDownload(selectedDetailImage.imageUrl, selectedDetailImage.title)}>
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
                    
                    <button className="lightbox-action-btn collection" onClick={() => openSaveModal(selectedDetailImage)}>
                      <FaPlus />
                      <span>Save to Collection</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SharedCollection;
