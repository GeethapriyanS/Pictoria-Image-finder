import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home3.css";
import logo from "../images/logo.png";
import searchIcon from "../images/search.png";
import UploadModal from "./uploadmodel.jsx";
import like from "../images/like.png";
import download from "../images/download.png";
import Navbar from "./Navbar.jsx";
import { FaHeart, FaDownload, FaPlus } from "react-icons/fa";

const Home3 = () => {
  const [likedImageUrls, setLikedImageUrls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDesc, setCollectionDesc] = useState("");

  const navigate = useNavigate();

  const [trendingSearches] = useState([
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
        const res = await axios.get(`http://localhost:5000/user/${userId}`);

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
    const fetchTrendingImages = async () => {
      try {
        setLoading(true);

        const trendingSearches = [
          "Animals",
          "Nature",
          "Travel",
          "Sports",
          "Art",
          "Finance",
          "Technology",
          "Cars",
        ];

        const allResults = await Promise.all(
          trendingSearches.map(async (query) => {
            const response = await axios.get(`http://localhost:5000/search`, {
              params: { query, per_page: 4 },
            });
            return response.data.results.map((img) => ({
              id: img.id,
              imageUrl: img.urls.small,
              title: img.alt_description || "Untitled",
              isUserUpload: false,
            }));
          })
        );

        const mergedImages = allResults.flat();
        setImages(mergedImages);
      } catch (error) {
        console.error("Error fetching trending images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingImages();
  }, []);

  const fetchImages = async (query, newPage = 1) => {
    try {
      setLoading(true);
      setLastQuery(query);

      let unsplashImages = [];
      if (query) {
        const response = await axios.get(`http://localhost:5000/search`, {
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
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm) {
      try {
        setLoading(true);
        setLastQuery(searchTerm);
        const response = await axios.get(`http://localhost:5000/search`, {
          params: { query: searchTerm },
        });

        const formattedImages = response.data.results.map((img) => ({
          id: img.id,
          imageUrl: img.urls.small,
          title: img.alt_description || "Untitled",
          isUserUpload: false,
        }));

        setImages(formattedImages);
      } catch (error) {
        console.error("Error searching images:", error);
      } finally {
        setLoading(false);
      }
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
        await axios.post(`http://localhost:5000/user/${userId}/unlike`, {
          imageUrl: image.imageUrl,
        });
        setLikedImageUrls((prev) =>
          prev.filter((url) => url !== image.imageUrl)
        );
        alert("Image unliked!");
      } else {
        // Like the image
        await axios.post(`http://localhost:5000/user/${userId}/like`, {
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
      await axios.post(`http://localhost:5000/user/${userId}/collections`, {
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
      <Navbar setShowUpload={setShowUpload} />
      <div className="container">
        <header className="homepage-header">
          <h1 className="homepage-title">
            Discover the best content on Pictoria
          </h1>
          <p className="homepage-description">Choose your interests</p>
        </header>

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
                <div className="image-card" key={image.id}>
                  <img src={image.imageUrl} alt={image.title} />

                  <div className="image-overlay">
                    <button
                      className="icon-btn"
                      onClick={() => handleLike(image)}
                    >
                      <FaHeart
                        size={16}
                        color={
                          likedImageUrls.includes(image.imageUrl)
                            ? "red"
                            : "lightgray"
                        }
                      />
                    </button>

                    <a className="icon-btn" href={image.imageUrl} download>
                      <FaDownload size={16} color={"lightgray"} />
                    </a>
                    <button
                      className="icon-btn"
                      onClick={() => openAddToCollection(image)}
                    >
                      <FaPlus size={16} color={"lightgray"} />
                    </button>
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

        {showUpload && <UploadModal close={() => setShowUpload(false)} />}

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
      </div>
    </>
  );
};

export default Home3;
