import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home3.css";
import API_BASE_URL from "../config";
import logo from "../images/logo.png";
import searchIcon from "../images/search.png";
import UploadModal from "./uploadmodel.jsx";
import like from "../images/like.png";
import download from "../images/download.png";
import Navbar from "./Navbar.jsx";
import { FaHeart, FaDownload, FaPlus, FaEdit } from "react-icons/fa";

const Home3 = () => {
  const [likedImageUrls, setLikedImageUrls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDesc, setCollectionDesc] = useState("");
  const [selectedDetailImage, setSelectedDetailImage] = useState(null);

  const navigate = useNavigate();

  const [trendingSearches] = useState([
    "Uploaded Images",
    "Sports",
    "Travel",
    "Art",
    "Animals",
    "Finance",
    "Technology",
    "Cars",
  ]);

  useEffect(() => {
    const fetchLikedImages = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/user/${userId}`);

        const likedImageObjects = res.data.images || [];
        const likedUrls = likedImageObjects.map((img) => img.imageUrl);

        setLikedImageUrls(likedUrls);
      } catch (err) {
        console.error("Failed to fetch liked images:", err);
      }
    };

    fetchLikedImages();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("token");
    if (user) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    fetchImages("Featured", 1);
  }, []);

  const fetchImages = async (query, newPage = 1) => {
    try {
      setLoading(true);
      setLastQuery(query);

      if (query === "Uploaded Images") {
        const res = await axios.get(`${API_BASE_URL}/user-images`);
        const allUploaded = (res.data.images || []).map((img) => ({
          id: img._id,
          imageUrl: img.imageUrl,
          title: img.title || "Untitled",
          isUserUpload: true,
        }));

        const perPage = 28;
        const startIndex = (newPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const pageImages = allUploaded.slice(startIndex, endIndex);

        setImages(pageImages);
        setPage(newPage);
        setHasMore(endIndex < allUploaded.length);
      } else {
        let unsplashImages = [];
        if (query) {
          const response = await axios.get(`${API_BASE_URL}/search`, {
            params: { query, per_page: 28, page: newPage },
          });

          unsplashImages = response.data.results.map((img) => ({
            id: img.id,
            imageUrl: img.urls.small,
            title: img.alt_description || "Untitled",
            isUserUpload: false,
          }));
        }

        setImages(unsplashImages);
        setPage(newPage);
        setHasMore(unsplashImages.length === 28);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm) {
      fetchImages(searchTerm, 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleNextPage = () => {
    fetchImages(lastQuery, page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchImages(lastQuery, page - 1);
    }
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleLike = async (image) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!checkAuth()) return;

      if (likedImageUrls.includes(image.imageUrl)) {
        // Already liked — now unlike
        await axios.post(`${API_BASE_URL}/user/${userId}/unlike`, {
          imageUrl: image.imageUrl,
        });
        setLikedImageUrls((prev) =>
          prev.filter((url) => url !== image.imageUrl)
        );
        alert("Image unliked!");
      } else {
        // Like the image
        await axios.post(`${API_BASE_URL}/user/${userId}/like`, {
          imageUrl: image.imageUrl,
          title: image.title,
        });
        setLikedImageUrls((prev) => [...prev, image.imageUrl]);
        alert("Image liked!");
      }
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const openAddToCollection = (image) => {
    if (!checkAuth()) return;
    setSelectedImage(image);
    console.log("Selected Image:", image);
    setShowCollectionModal(true);
  };

  const handleAddToCollection = async () => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.post(`${API_BASE_URL}/user/${userId}/collections`, {
        name: collectionName,
        description: collectionDesc,
        imageUrl: selectedImage.imageUrl,
        title: selectedImage.title,
        uploadedBy: userId,
      });
      console.log("Image added to collection:", selectedImage.imageUrl);

      alert("Image added to collection!");
      setShowCollectionModal(false);
      setCollectionName("");
      setCollectionDesc("");
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };

  const checkAuth = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please create an account or log in to use this feature.");
      navigate("/signup");
      return false;
    }
    return true;
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <header className="homepage-header">
          <h1 className="homepage-title">
            Discover the best content on Pictoria
          </h1>
          <p className="homepage-description">Your all-in-one visual exploration & creation workspace</p>
        </header>

        <div className="hero-banner glass glow">
          <h2>Create, Edit, and Curate</h2>
          <p>
            Welcome to Pictoria, a modern MERN platform built for designers and creators.
            Explore stock imagery, generate original artwork with our AI engine, refine assets inside
            our embedded Photopea editor, and curate shared collections with clients or collaborators.
          </p>
        </div>

        <div className="trending-tags">
          {trendingSearches.map((item, index) => (
            <span
              key={index}
              className="tag"
              onClick={() => fetchImages(item, 1)}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" onClick={handleSearch}>
            <img src={searchIcon} alt="Search" />
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="image-grid">
              {images.map((image, index) => (
                <div 
                  className="image-card" 
                  key={image.id || index}
                  onClick={() => setSelectedDetailImage(image)}
                  style={{ cursor: "pointer" }}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={image.title} 
                  />

                  <div className="image-overlay">
                    {/* Nice dark hover overlay overlaying the card */}
                  </div>

                  <div className="image-card-footer">
                    <span className="image-title">{image.title || "Untitled Artwork"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button onClick={handlePrevPage} disabled={page === 1}>
                Previous
              </button>
              <span> Page {page} </span>
              <button onClick={handleNextPage} disabled={!hasMore}>
                Next
              </button>
            </div>
          </>
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

        <section className="info-section">
          <h2 className="info-section-title">Explore Pictoria's Core Capabilities</h2>
          <div className="info-grid">
            <div className="info-card glass">
              <div className="info-icon">🔍</div>
              <h3>Explore Visuals</h3>
              <p>Search millions of high-resolution stock photos and curated assets sorted across categories.</p>
            </div>
            <div className="info-card glass">
              <div className="info-icon">⚡</div>
              <h3>AI Generation</h3>
              <p>Turn descriptions into high-fidelity image designs instantly with our generative model interface.</p>
            </div>
            <div className="info-card glass">
              <div className="info-icon">🎨</div>
              <h3>Photopea Editor</h3>
              <p>Modify and refine visual assets. Crop, add filters, or paint directly with advanced layered editing.</p>
            </div>
            <div className="info-card glass">
              <div className="info-icon">🔗</div>
              <h3>Share Collections</h3>
              <p>Compile custom collections, control privacy visibility, and generate secure public links to share.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home3;
